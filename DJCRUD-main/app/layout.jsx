import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Song Requests",
  description: "Simple song request box with an admin dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <div
          className="pointer-events-none fixed bottom-3 left-1/2 -translate-x-1/2 select-none rounded-full border border-white/40 bg-white/35 px-3 py-1 text-xs shadow-sm backdrop-blur"
          aria-hidden="true"
        >
          <span className="bg-gradient-to-r from-orange-700 via-amber-600 to-yellow-500 bg-clip-text font-semibold tracking-wide text-transparent">
            Teacups
          </span>
        </div>
      </body>
    </html>
  );
}
