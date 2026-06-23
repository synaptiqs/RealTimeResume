import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealTimeResume",
  description:
    "Turn your daily activities into professional skills and a polished resume.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
