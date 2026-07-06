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

// Async Server Component to access cookies and fetch session inside a Suspense boundary
async function ServerAppProvider({ children }: { children: React.ReactNode }) {
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
    console.error("Error fetching session in ServerAppProvider:", err);
  }

  return (
    <AppProvider initialSession={session} initialIsOnboarded={initialIsOnboarded}>
      {children}
    </AppProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased bg-background">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png?v=2" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png?v=2" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png?v=2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#f2f2ee" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Detect Standalone (PWA) Mode
              if (window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches) {
                document.documentElement.classList.add('standalone-mode');
              }

              // Force Service Worker Update and Cache Clear to bust stale PWA builds
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      for (var i = 0; i < registrations.length; i++) {
                        registrations[i].unregister();
                      }
                    });
                  } else {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(reg) {
                        reg.update(); // Force update SW
                      }
                    );
                    // Force clear all caches to guarantee fresh UI load on iOS PWA
                    caches.keys().then(function(names) {
                      for (let name of names) {
                        caches.delete(name);
                      }
                    });
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className={`h-[100dvh] w-screen flex flex-col overflow-hidden bg-background ${syne.variable} ${instrument.variable} ${jetbrains.variable} font-body relative`}>
        {/* Green Haze Background */}
        <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-primary opacity-[0.08] dark:opacity-15 blur-[150px] pointer-events-none -z-10 translate-x-1/4 translate-y-1/4 rounded-full" />
        
        <Suspense fallback={
          <div className="flex flex-1 w-full items-center justify-center bg-background text-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }>
          <ServerAppProvider>
            <AppShell>{children}</AppShell>
          </ServerAppProvider>
        </Suspense>
      </body>
    </html>
  );
}
