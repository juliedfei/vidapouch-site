import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
 subsets: ["latin"],
 variable: "--font-manrope",
});

const geistMono = Geist_Mono({
 subsets: ["latin"],
 variable: "--font-geist-mono",
});

export const metadata: Metadata = {
 title: "VidaPouch",
 description: "VidaPouch",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
   <html
     lang="en"
     className={`${manrope.variable} ${geistMono.variable}`}>

     <body>{children}</body>
   </html>
 );
}