import { HomePage } from '@/components/home/HomePage';
import { TrainRide } from '@/components/ride/TrainRide';

export default function Page() {
  return (
    <>
      {/* recruiter deep links (?for=…, ?ride=skip) and repeat loads in the same visit hide the intro before first paint; ?ride=on forces it */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var q=new URLSearchParams(location.search);if(q.get('ride')!=='on'&&(q.has('for')||q.get('ride')==='skip'||sessionStorage.getItem('srihari_ride_seen')==='1')){document.documentElement.classList.add('ride-skip')}}catch(e){}",
        }}
      />
      <style>{'html.ride-skip .ride{display:none!important}html.ride-skip.ride-on,html.ride-skip.ride-on body{overflow:auto!important}'}</style>
      <HomePage />
      {/* the train-ride intro: the entry point on every load and refresh */}
      <TrainRide />
      <noscript>
        <style>{'.ride{display:none!important}html.ride-on,html.ride-on body{overflow:auto!important}'}</style>
      </noscript>
    </>
  );
}
