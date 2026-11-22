import type { Metadata } from 'next';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/dm-sans/index.css';
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
            __html: "try{if(localStorage.getItem('srihari_portfolio_mode')==='tfi'){document.documentElement.classList.add('tfi-theme','dark')}}catch(e){}",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=DM+Serif+Display:ital@0;1&amp;display=swap"
          rel="stylesheet"
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
