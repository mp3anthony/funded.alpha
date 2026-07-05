import { Syne, Instrument_Sans, JetBrains_Mono } from 'next/font/google';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap'
});

const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap'
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap'
});
import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import AppShell from "@/components/AppShell";
import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type Session } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Funded",
  description: "Household Finance Control Center",
  manifest: "/manifest.json?v=2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Funded",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session: Session | null = null;
  let initialIsOnboarded = false;

  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Safe to ignore in Server Components
              }
            },
          },
        }
      );

      const { data } = await supabase.auth.getSession();
      session = data.session;

      if (session?.user) {
        const { data: membership } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        initialIsOnboarded = !!membership?.household_id;
      }
    }
  } catch (err) {
    console.error("Error fetching session in RootLayout:", err);
  }

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png?v=2" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png?v=2" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png?v=2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#c8ff00" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      for (var i = 0; i < registrations.length; i++) {
                        registrations[i].unregister();
                        console.log('SW unregistered in development:', registrations[i].scope);
                      }
                    });
                  } else {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(reg) {
                        console.log('SW registered:', reg.scope);
                      },
                      function(err) {
                        console.log('SW registration failed:', err);
                      }
                    );
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${syne.variable} ${instrument.variable} ${jetbrains.variable} font-body`}>
        <AppProvider initialSession={session} initialIsOnboarded={initialIsOnboarded}>
          <Suspense fallback={null}>
            <AppShell>{children}</AppShell>
          </Suspense>
        </AppProvider>
      </body>
    </html>
  );
}
