import { Geist, Geist_Mono, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import NavBar from "../components/NavBar";
 
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
 
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
 
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});
 
export const metadata = {
  title: "Generation Prevention: Parliamentary Summit",
  description: "Lady Garden Foundation's 2026 Student Networking Event",
   manifest: "/manifest.json",
};
 
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable} antialiased`}>
        {children}
        <NavBar />
      </body>
    </html>
  );
}
 