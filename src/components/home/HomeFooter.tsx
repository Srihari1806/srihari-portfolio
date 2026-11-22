import Link from 'next/link';
import { footer } from '@/data/home';
import { PixelDino } from './Doodles';

export function HomeFooter() {
  return (
    <footer id="human" className="hm-footer">
      <p className="hm-footer-intro">
        <PixelDino className="hm-dino" />
        {footer.intro}
      </p>
      <p className="hm-footer-status">
        <span className="hm-dot hm-dot--green" aria-hidden="true" />
        <span>
          Currently building:{' '}
          <a href="https://cricfield.in" target="_blank" rel="noopener noreferrer" className="hm-footer-strong">
            {footer.currentlyBuilding}
          </a>
        </span>
        <span className="hm-footer-sep" aria-hidden="true">/</span>
        <span>Next: {footer.next}</span>
      </p>
      <a href="#top" className="hm-footer-more" aria-label="Back to top">
        ···
      </a>
    </footer>
  );
}
