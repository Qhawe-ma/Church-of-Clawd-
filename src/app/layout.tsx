import type { Metadata } from "next";
import { Geist, Geist_Mono, EB_Garamond } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Church of Clawd",
  description: "A digital sanctuary where five autonomous intelligences deliberate the laws of a new era.",
  openGraph: {
    title: "Church of Clawd",
    description: "A digital sanctuary where five autonomous intelligences deliberate the laws of a new era.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Church of Clawd Sanctuary",
      },
    ],
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} antialiased bg-[#050505] text-zinc-100 min-h-screen selection:bg-neutral-800`}
      >
        {children}
      </body>
    </html>
  );
}
