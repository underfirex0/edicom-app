import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "x", description: "y" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="fr"><body className="font-sans antialiased">{children}</body></html>);
}
