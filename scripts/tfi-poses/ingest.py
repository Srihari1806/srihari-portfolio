#!/usr/bin/env python3
"""
TFI room — character pose ingest.

Turns the full-room images in art-source/tfi-poses/ into the small transparent layers the night
homepage composites over src/assets/tfi/room.webp:

  plate.*                 the same room with the boy AND the flight-ticket bubble painted out
  rug-a.* / rug-b.*       lying on the rug with the phone         (b: eyes closed)
  desk-a.* / desk-b.*     in the desk chair typing                 (b: hands on different keys)
  sleep-a.* / sleep-b.*   asleep under the blanket                 (b: chest/blanket slightly risen)
  tv-a.* / tv-b.*         sitting on the bed watching the TV       (b: eyes closed)
  <pose>-c.*  (optional)  a small head turn, shown now and then

Each image may be any size/crop the image tool produced: it is registered back onto room.webp with
SIFT + RANSAC, colour-matched to it, and only the pixels that differ from the restored room inside
that pose's region are kept. Furniture painted in front of the boy (the desk edge, the blanket)
therefore stays out of the cut-out and the room's own pixels show through: occlusion is exact.

Output: public/tfi/poses/*.webp + src/data/tfiPoses.json, plus review sheets in .cache/tfi-poses/.
Usage:  python scripts/tfi-poses/ingest.py   (needs: pip install opencv-python numpy scipy pillow)
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(os.environ.get('TFI_ROOT') or Path(__file__).resolve().parents[2])
SRC = ROOT / 'art-source' / 'tfi-poses'
ROOM = ROOT / 'src' / 'assets' / 'tfi' / 'room.webp'
OUT = ROOT / 'public' / 'tfi' / 'poses'
MANIFEST = ROOT / 'src' / 'data' / 'tfiPoses.json'
REVIEW = ROOT / '.cache' / 'tfi-poses'
W, H = 1672, 941

# regions (room pixels) where each layer is allowed to come from — generous, the diff does the rest
ROI = {
    'boy': (640, 330, 960, 880),  # the baked-in boy on the rug
    'bubble': (750, 230, 1070, 455),  # the flight-ticket thought bubble + its little tail circles
    'rug': (600, 230, 1100, 900),
    'desk': (250, 120, 720, 560),
    'sleep': (1330, 90, 1672, 760),
    'tv': (1300, 90, 1672, 760),
}
POSES = ['rug', 'desk', 'sleep', 'tv']


def load(p: Path) -> np.ndarray:
    return cv2.cvtColor(np.array(Image.open(p).convert('RGB')), cv2.COLOR_RGB2BGR)


def find(stem: str) -> Path | None:
    for ext in ('png', 'webp', 'jpg', 'jpeg'):
        p = SRC / f'{stem}.{ext}'
        if p.exists():
            return p
    return None


def roi_mask(*keys: str, pad: int = 0) -> np.ndarray:
    m = np.zeros((H, W), bool)
    for k in keys:
        x0, y0, x1, y1 = ROI[k]
        m[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad] = True
    return m


def register(img: np.ndarray, ref: np.ndarray, exclude: np.ndarray) -> np.ndarray:
    """Warp img onto ref's 1672×941 frame using features outside the edited region."""
    sift = cv2.SIFT_create(6000)
    g1, g2 = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY)
    k1, d1 = sift.detectAndCompute(g1, None)
    k2, d2 = sift.detectAndCompute(g2, (~exclude).astype(np.uint8) * 255)
    m = cv2.BFMatcher().knnMatch(d1, d2, k=2)
    good = [a for a, b in (x for x in m if len(x) == 2) if a.distance < 0.72 * b.distance]
    if len(good) < 40:
        sys.exit(f'  ! only {len(good)} feature matches — is this the same room composition?')
    src = np.float32([k1[a.queryIdx].pt for a in good])
    dst = np.float32([k2[a.trainIdx].pt for a in good])
    Hm, inl = cv2.findHomography(src, dst, cv2.RANSAC, 3.0)
    warped = cv2.warpPerspective(img, Hm, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
    resid = np.median(np.linalg.norm(cv2.perspectiveTransform(src[inl.ravel() == 1][None], Hm)[0] - dst[inl.ravel() == 1], axis=1))
    print(f'    registered: {int(inl.sum())}/{len(good)} inliers, median error {resid:.2f}px')
    return warped


def colour_match(img: np.ndarray, ref: np.ndarray, where: np.ndarray) -> np.ndarray:
    """Per-channel mean/std transfer in Lab, measured where the two should be the same room."""
    a = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    b = cv2.cvtColor(ref, cv2.COLOR_BGR2LAB).astype(np.float32)
    for c in range(3):
        ma, sa = a[..., c][where].mean(), a[..., c][where].std() + 1e-3
        mb, sb = b[..., c][where].mean(), b[..., c][where].std() + 1e-3
        a[..., c] = (a[..., c] - ma) * (sb / sa) + mb
    return cv2.cvtColor(np.clip(a, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)


def delta_e(x: np.ndarray, y: np.ndarray) -> np.ndarray:
    a = cv2.cvtColor(x, cv2.COLOR_BGR2LAB).astype(np.float32)
    b = cv2.cvtColor(y, cv2.COLOR_BGR2LAB).astype(np.float32)
    # small blur so one-pixel redraw jitter in the line art doesn't read as change
    return cv2.GaussianBlur(np.linalg.norm(a - b, axis=2), (3, 3), 0)


def threshold(de: np.ndarray, outside: np.ndarray) -> float:
    return max(16.0, float(np.percentile(de[outside], 97)) * 1.35)


def clean_mask(m: np.ndarray, min_frac: float = 0.02) -> np.ndarray:
    m = ndimage.binary_opening(m, iterations=1)
    m = ndimage.binary_closing(m, structure=np.ones((5, 5)), iterations=2)
    m = ndimage.binary_fill_holes(m)
    lab, n = ndimage.label(m)
    if n == 0:
        return m
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    keep = [i + 1 for i, s in enumerate(sizes) if s >= sizes.max() * min_frac and s >= 150]
    return np.isin(lab, keep)


def feather(m: np.ndarray, grow: int, soft: float) -> np.ndarray:
    if grow:
        m = ndimage.binary_dilation(m, iterations=grow)
    a = cv2.GaussianBlur(m.astype(np.float32), (0, 0), soft) if soft else m.astype(np.float32)
    return np.clip(a * 1.15, 0, 1)


def save_layer(name: str, img: np.ndarray, alpha: np.ndarray) -> dict:
    ys, xs = np.nonzero(alpha > 0.01)
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    rgba = np.dstack([cv2.cvtColor(img, cv2.COLOR_BGR2RGB), (alpha * 255).astype(np.uint8)])[y0:y1, x0:x1]
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba).save(OUT / f'{name}.webp', 'WEBP', quality=90, method=6)
    print(f'    → public/tfi/poses/{name}.webp  {x1 - x0}×{y1 - y0} at ({x0},{y0})')
    return {'src': f'/tfi/poses/{name}.webp', 'box': [x0, y0, x1, y1]}


def over(base: np.ndarray, img: np.ndarray, a: np.ndarray) -> np.ndarray:
    return (base * (1 - a[..., None]) + img * a[..., None]).astype(np.uint8)


def main() -> None:
    room = load(ROOM)
    REVIEW.mkdir(parents=True, exist_ok=True)
    plate_p = find('plate')
    if not plate_p:
        sys.exit(f'Put plate.png (the room without the boy and the bubble) in {SRC}')

    print('plate')
    edit = roi_mask('boy', 'bubble', pad=30)
    plate = register(load(plate_p), room, edit)
    plate = colour_match(plate, room, ~roi_mask('boy', 'bubble', 'rug', pad=40))
    de = delta_e(plate, room)
    t = threshold(de, ~roi_mask('boy', 'bubble', 'rug', pad=40))
    boy = clean_mask((de > t) & roi_mask('boy', 'bubble'))
    patch_a = feather(boy, grow=6, soft=3)
    clean = over(room, plate, patch_a)
    manifest: dict = {'version': 1, 'plate': save_layer('plate', plate, patch_a)}

    bubble = clean_mask((de > t) & roi_mask('bubble'), min_frac=0.005)
    manifest['bubble'] = save_layer('bubble', room, feather(bubble, grow=1, soft=0.8))
    # the bubble is its own layer (rug shot only): keep it out of every pose cut-out
    no_bubble = ~ndimage.binary_dilation(bubble, iterations=3)
    cv2.imwrite(str(REVIEW / 'clean-room.png'), clean)

    manifest['poses'] = {}
    outside_all = ~roi_mask(*POSES, pad=40)
    for pose in POSES:
        ap = find(f'{pose}-a')
        if pose == 'rug' and not ap:
            # the rug shot is the boy already in room.webp; his blink is the existing eye patch
            ap = ROOM
            if not find('rug-b'):
                rb = np.array(Image.open(ROOM).convert('RGB'))
                patch = np.array(Image.open(ROOT / 'src' / 'assets' / 'tfi' / 'blink.png').convert('RGBA')).astype(np.float32) / 255
                x0, y0 = 714, 450  # blinkBox in src/data/tfi.ts
                reg = rb[y0:y0 + patch.shape[0], x0:x0 + patch.shape[1]].astype(np.float32) / 255
                rb[y0:y0 + patch.shape[0], x0:x0 + patch.shape[1]] = ((reg * (1 - patch[..., 3:]) + patch[..., :3] * patch[..., 3:]) * 255).astype(np.uint8)
                REVIEW.mkdir(parents=True, exist_ok=True)
                Image.fromarray(rb).save(REVIEW / 'rug-b.png')
        if not ap:
            print(f'{pose}: no {pose}-a image yet — skipped')
            continue
        print(pose)
        region = roi_mask(pose)
        a_img = register(load(ap), room, roi_mask(pose, 'boy', 'bubble', pad=30))
        a_img = colour_match(a_img, clean, outside_all & ~roi_mask('boy', 'bubble', pad=30))
        de_a = delta_e(a_img, clean)
        ta = threshold(de_a, outside_all)
        body = clean_mask((de_a > ta) & region & no_bubble)
        body_a = feather(body, grow=1, soft=0.9)
        entry = {'a': save_layer(f'{pose}-a', a_img, body_a)}
        sheet = [over(clean, a_img, body_a)]

        for frame in ('b', 'c'):
            fp = find(f'{pose}-{frame}') or (REVIEW / 'rug-b.png' if pose == 'rug' and frame == 'b' and (REVIEW / 'rug-b.png').exists() else None)
            if not fp:
                continue
            f_img = register(load(fp), room, roi_mask(pose, 'boy', 'bubble', pad=30))
            f_img = colour_match(f_img, clean, outside_all & ~roi_mask('boy', 'bubble', pad=30))
            f_body = clean_mask((delta_e(f_img, clean) > ta) & region & no_bubble)
            near = ndimage.binary_dilation(body | f_body, iterations=4)
            changed = clean_mask((delta_e(f_img, a_img) > ta) & near, min_frac=0.01)
            union = body | f_body
            share = changed.sum() / max(1, union.sum())
            if share > 0.35:
                # the tool redrew the whole figure: swap whole frames instead of patching parts
                entry[frame] = {**save_layer(f'{pose}-{frame}', f_img, feather(f_body, 1, 0.9)), 'mode': 'swap'}
            else:
                part = feather(ndimage.binary_dilation(changed, iterations=3) & ndimage.binary_dilation(union, iterations=1), grow=0, soft=1.4)
                entry[frame] = {**save_layer(f'{pose}-{frame}', f_img, part), 'mode': 'part'}
            print(f'    {frame}: {share:.0%} of the figure changed → {entry[frame]["mode"]}')
            sheet.append(over(sheet[0], f_img, part if share <= 0.35 else feather(f_body, 1, 0.9)))

        manifest['poses'][pose] = entry
        x0, y0, x1, y1 = ROI[pose]
        cv2.imwrite(str(REVIEW / f'{pose}.png'), np.hstack([s[y0:y1, x0:x1] for s in sheet]))

    MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'\nwrote {MANIFEST.relative_to(ROOT)} — {len(manifest["poses"])} pose(s). Review sheets: .cache/tfi-poses/')


if __name__ == '__main__':
    main()
