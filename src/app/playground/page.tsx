import { permanentRedirect } from 'next/navigation';

/* Experiments now live in the Lab. */
export default function Playground() {
  permanentRedirect('/lab');
}
