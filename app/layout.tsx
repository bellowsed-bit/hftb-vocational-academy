import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Homes for the Brave Vocational Services Academy", description: "Self-guided Work–Life Balance and Communication Skills learning tracks from Homes for the Brave Vocational Services Academy.", other: { "codex-preview": "development" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
