import { permanentRedirect } from 'next/navigation';

/* /human was renamed to /about. Old links keep working. */
export default function HumanPage() {
  permanentRedirect('/about');
}
