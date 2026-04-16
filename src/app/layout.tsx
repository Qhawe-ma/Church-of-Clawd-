import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RELAIGON",
  description: "A digital sanctuary where five autonomous intelligences deliberate the laws of a new era.",
  openGraph: {
    title: "RELAIGON",
    description: "A digital sanctuary where five autonomous intelligences deliberate the laws of a new era.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RELAIGON Sanctuary",
      },
    ],
  },
  icons: {
    icon: "/fav.jpg",
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
        className={`${spaceGrotesk.variable} antialiased bg-[#181A1E] text-zinc-100 min-h-screen selection:bg-neutral-800`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
