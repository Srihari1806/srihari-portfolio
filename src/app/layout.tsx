import type { Metadata } from 'next';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/dm-sans/index.css';
import '@fontsource/dm-serif-display/latin-400.css';
import '@fontsource/dm-serif-display/latin-400-italic.css';
import '@fontsource/shadows-into-light-two/400.css';
import './globals.css';
import { ModeProvider } from '@/context/ModeContext';
import { RoleProvider } from '@/context/RoleContext';

export const metadata: Metadata = {
  title: 'Srihari | Interactive Portfolio & Multi-Disciplinary Builder',
  description:
    'Production-ready personal portfolio for Srihari, an Electronics & Computer Science engineer combining development, product thinking, analytics, design, marketing, music, writing, cricket and cinema.',
  keywords: [
    'Srihari',
    'Product Management',
    'Software Engineer',
    'Data Analytics',
    'CricField',
    'Telugu Cinema',
    'Next.js Portfolio',
    'Electronics and Computer Science',
  ],
  authors: [{ name: 'Srihari' }],
  openGraph: {
    title: 'Srihari | Somewhere between logic & imagination',
    description:
      'Role-based portfolio spanning Product Management, Software Engineering, Data Analytics, UI/UX, and Telugu Cinema Desk mode.',
    type: 'website',
  },
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
            __html:
              "try{if(localStorage.getItem('srihari_portfolio_mode')==='tfi'){document.documentElement.classList.add('tfi-theme','dark')}}catch(e){}" +
              // already took the train-ride intro this visit: keep it from flashing up before the page loads
              "try{if(sessionStorage.getItem('srihari_ride_done')&&!/[?&]ride/.test(location.search)){document.documentElement.classList.add('ride-done')}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased selection:bg-lime-300 selection:text-neutral-900 dark:selection:bg-lime-400 dark:selection:text-neutral-950">
        <ModeProvider>
          <RoleProvider>
            <main className="flex-1">{children}</main>
          </RoleProvider>
        </ModeProvider>
      </body>
    </html>
  );
}
