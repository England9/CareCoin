import type { Metadata } from "next";
import { Outfit, Nunito_Sans } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";

const display = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Care Coin — Get Paid to Care",
  description:
    "Gamified charity volunteering with verified impact, Care Coin rewards, leaderboards, and a demo rewards marketplace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} font-body antialiased`}>
        <Providers>
          <Nav />
          <main className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl px-4 py-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-teal-900/10 bg-white/50">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p>
                <span className="font-display font-bold text-teal-900">Care Coin</span> · Get Paid
                to Care
              </p>
              <p className="text-xs">
                Demo rewards & sample stats are labeled. Precise GPS is only requested at
                check-in/out.{" "}
                <a className="font-semibold text-teal-700 underline" href="/privacy">
                  Privacy
                </a>
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
