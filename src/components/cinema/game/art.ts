import * as T from 'three';

export const paint = { mint:'#82ab98', pale:'#b7c8a1', pine:'#2c5149', trim:'#f1d79f', ox:'#793b3b', wood:'#794c35', brass:'#bc914e', ink:'#292f2e', amber:'#ffd286' };
export function random(seed: number) { return () => { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; }; }
export function canvasTexture(w:number,h:number,draw:(c:CanvasRenderingContext2D)=>void) {
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const c=canvas.getContext('2d');if(!c)throw new Error('Canvas drawing unavailable');
  draw(c);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  return texture;
}
function grain(c:CanvasRenderingContext2D,w:number,h:number,seed=5,amount=.13) {
  const r=random(seed), pixels=c.getImageData(0,0,w,h);
  for(let i=0;i<pixels.data.length;i+=4){ const v=(r()-.5)*255*amount;
    for(let k=0;k<3;k++) pixels.data[i+k]+=v;
  } c.putImageData(pixels,0,0);
}
export function surface(kind:'plaster'|'terrazzo'|'carpet') {
  const tex=canvasTexture(256,256,c=>{
    const r=random(193); c.fillStyle=kind==='carpet'?'#e7d6c5':'#f0ecde';c.fillRect(0,0,256,256);
    if(kind==='terrazzo'){
      for(let i=0;i<1900;i++){const x=r()*256,y=r()*256,s=.45+r()*2.6;c.fillStyle=['#d5c7b7','#a99991','#faf2db','#a7aba1','#dac3ab'][i%5];c.beginPath();c.moveTo(x,y);c.lineTo(x+s,y+.6);c.lineTo(x+s*.4,y+s);c.fill();}
      c.strokeStyle='#a8957e';c.lineWidth=1;c.strokeRect(0,0,256,256);
    }else if(kind==='carpet'){
      c.strokeStyle='rgba(255,248,218,.52)';c.lineWidth=1.4;
      for(let ix=-1;ix<5;ix++)for(let iy=-1;iy<5;iy++){const x=ix*64+(iy%2)*32,y=iy*64;c.beginPath();c.moveTo(x,y-8);c.lineTo(x+5,y);c.lineTo(x,y+8);c.lineTo(x-5,y);c.closePath();c.stroke();}
    }else{
      for(let i=0;i<380;i++){c.fillStyle='rgba(113,92,67,.055)';c.fillRect(r()*256,r()*256,1+r()*7,1+r()*4);}
    }
    grain(c,256,256,9,kind==='plaster'?.12:.08);
  });tex.wrapS=tex.wrapT=T.RepeatWrapping;return tex;
}
export function signTexture(title:string,sub:string,bg:string,fg:string,ratio=3.4) {
  const w=768,h=Math.max(112,Math.round(w/ratio));
  return canvasTexture(w,h,c=>{
    c.fillStyle=bg;c.fillRect(0,0,w,h); c.strokeStyle=fg;c.globalAlpha=.67;c.lineWidth=2;c.strokeRect(12,10,w-24,h-20);
    c.globalAlpha=1;c.textAlign='center';c.textBaseline='middle';const max=Math.min(h*(sub?.48:.63),w/(Math.max(1,title.length)*.62));
    c.fillStyle=fg;c.font='bold '+max+'px Georgia, serif';c.fillText(title,w/2,h*(sub?.41:.51),w*.91);
    if(sub){c.font='600 '+Math.min(h*.15,32)+'px Segoe UI, sans-serif';c.fillText(sub,w/2,h*.75,w*.88);}
    grain(c,w,h,7,.053);
  });
}
export function posterTexture(which:number,label?:string) {
  const palettes=[['#f1c08b','#dc7653','#98483c','#384a48','#f4e1b0'],['#d1d0ad','#8ba9a1','#477d78','#2c5051','#efe0b0'],['#edc98f','#bf935c','#795b55','#413f4b','#f6dfaa'],['#ebb9a0','#ce8375','#905f6b','#485765','#f7e3c0']];
  const [sky,far,mid,near,white]=palettes[which%4],r=random(191+which*8);
  return canvasTexture(320,464,c=>{
    c.fillStyle=white;c.fillRect(0,0,320,464);c.save();c.beginPath();c.rect(12,12,296,390);c.clip();
    c.fillStyle=sky;c.fillRect(0,0,320,410);c.fillStyle=white;c.beginPath();c.arc(78+which%3*69,94,42,0,7);c.fill();
    for(let layer=0;layer<3;layer++){c.fillStyle=[far,mid,near][layer];c.beginPath();c.moveTo(-10,450);c.lineTo(-10,200+layer*54);
      for(let x=-10;x<=335;x+=18)c.lineTo(x,164+layer*63+Math.sin(x/49+layer*2+which)*26+r()*18);c.lineTo(340,440);c.fill();}
    c.strokeStyle=near;c.lineWidth=4;
    if(which%2===0){
      for(const x of [45,67,248]){const h=87+r()*35,y=315; c.beginPath();c.moveTo(x-6,y);c.quadraticCurveTo(x-2,y-h/2,x+9,y-h);c.stroke();c.fillStyle=near;
        for(let a=0;a<12;a++){const angle=a*.54;c.beginPath();c.moveTo(x+9,y-h);c.quadraticCurveTo(x+9+Math.cos(angle)*23,y-h-12+Math.sin(angle)*12,x+9+Math.cos(angle)*34,y-h+7+Math.sin(angle)*20);c.quadraticCurveTo(x+12,y-h+1,x+9,y-h);c.fill();}
      }
    }else{
      for(let j=0;j<6;j++){const x=30+j*47,y=236+Math.sin(j)*16;c.fillStyle=near;c.fillRect(x,y,39,49);c.beginPath();c.arc(x+19.5,y,19.5,Math.PI,2*Math.PI);c.fill();c.fillStyle=far;c.fillRect(x+16,y+12,6,14);}
    }
    c.fillStyle=white;c.globalAlpha=.45;for(let i=0;i<75;i++)c.fillRect(r()*320,325+r()*50,1+r()*11,.8);c.restore();
    c.fillStyle=near;c.font='bold 24px Georgia';c.textAlign='center';c.fillText(label??['MATINEE','35 mm','INTERVAL','EVENING SHOW'][which%4],160,434,281);
    grain(c,320,464,which+4,.19);return;
  });
}
export function shadowTexture() {return canvasTexture(96,96,c=>{const g=c.createRadialGradient(48,48,0,48,48,48);g.addColorStop(0,'rgba(31,22,17,.54)');g.addColorStop(.47,'rgba(37,26,21,.28)');g.addColorStop(1,'rgba(35,27,21,0)');c.fillStyle=g;c.fillRect(0,0,96,96);});}

