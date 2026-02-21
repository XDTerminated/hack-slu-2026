import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, DM_Serif_Display, Josefin_Sans, Maitree } from "next/font/google";

export const metadata: Metadata = {
  title: "Cognify",
  description: "AI-powered study tool for Canvas LMS",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const josefinSans = Josefin_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-josefin-sans",
});

const maitree = Maitree({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-maitree",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${dmSerif.variable} ${josefinSans.variable} ${maitree.variable}`}>
      <body className="font-maitree">{children}</body>
    </html>
  );
}
