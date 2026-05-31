import type { Metadata } from "next";
import "./globals.css";
import { DemoProvider } from "@/lib/demo-store";

export const metadata: Metadata = {
  title: "PEAK — Writing support",
  description:
    "A scaffolded writing workflow for students with dysgraphia, dyslexia, and ADHD. Your words, lightly tidied.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/*
          Atkinson Hyperlegible — primary, per British Dyslexia Association
          guidance. Loaded synchronously via <link> for first-paint legibility.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
