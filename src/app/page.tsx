import { HomePage } from '@/components/home/HomePage';
import { TrainRide } from '@/components/ride/TrainRide';

export default function Page() {
  return (
    <>
      <HomePage />
      {/* the train-ride intro, once per visit (add ?ride to the URL to ride again) */}
      <TrainRide />
      <noscript>
        <style>{'.ride{display:none!important}html.ride-on,html.ride-on body{overflow:auto!important}'}</style>
      </noscript>
    </>
  );
}
