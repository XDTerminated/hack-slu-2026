import "~/styles/globals.css";

import { type Metadata } from "next";
<<<<<<< Updated upstream
import { Geist, DM_Serif_Display } from "next/font/google";
=======
import { Geist, DM_Serif_Display, Josefin_Sans, Maitree } from "next/font/google";
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
<<<<<<< Updated upstream
    <html lang="en" className={`${geist.variable} ${dmSerif.variable}`}>
      <body className="font-sans">{children}</body>
=======
    <html lang="en" className={`${geist.variable} ${dmSerif.variable} ${josefinSans.variable} ${maitree.variable}`}>
      <body className="font-maitree">{children}</body>
>>>>>>> Stashed changes
    </html>
  );
}
