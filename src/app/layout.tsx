import type { Metadata } from 'next';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/dm-sans/index.css';
import '@fontsource/dm-serif-display/latin-400.css';
import '@fontsource/dm-serif-display/latin-400-italic.css';
import '@fontsource/shadows-into-light-two/400.css';
import './globals.css';
import { ModeProvider } from '@/context/ModeContext';
import { RoleProvider } from '@/context/RoleContext';
import { PortalLayer } from '@/components/ride/PortalLayer';

export const metadata: Metadata = {
  metadataBase: new URL('https://srihari-portfolio-three.vercel.app'),
  title: 'Beesetti Srihari — Data-driven Product Builder | Portfolio',
  description:
    'Electronics & Computer Science undergraduate (class of 2027) building products with engineering, data and storytelling. Projects: CricField, HireMap, Cinephile. Open to internships and graduate roles in data, software, applied AI and product.',
  keywords: [
    'Beesetti Srihari',
    'Data Analyst',
    'Product Analyst',
    'Software Engineer',
    'Applied AI',
    'Associate Product Manager',
    'CricField',
    'Cricket analytics',
    'KIIT',
    'Electronics and Computer Science',
  ],
  authors: [{ name: 'Beesetti Srihari' }],
  openGraph: {
    title: 'Beesetti Srihari | Somewhere between logic & imagination',
    description:
      'Data-driven product builder. Engineering, analytics, product thinking and storytelling — with a train ride through cricket, cinema and music.',
    type: 'website',
    url: '/',
  },
  twitter: { card: 'summary_large_image', title: 'Beesetti Srihari — Data-driven Product Builder' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* apply the saved day/night mode before first paint, so night visitors never see a flash of day */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('srihari_portfolio_mode')==='tfi'){document.documentElement.classList.add('tfi-theme','dark')}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased selection:bg-amber-300 selection:text-neutral-900 dark:selection:bg-amber-400 dark:selection:text-neutral-950">
        <ModeProvider>
          <RoleProvider>
            <main className="flex-1">{children}</main>
            {/* the train-window portal: dives into stops and the Return to train button on them */}
            <PortalLayer />
          </RoleProvider>
        </ModeProvider>
      </body>
    </html>
  );
}
