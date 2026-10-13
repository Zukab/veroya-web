import { Fraunces, Geist, Geist_Mono } from "next/font/google";

// Fuentes compartidas por la web pública y el panel.

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Serif para los títulos.
export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`;
