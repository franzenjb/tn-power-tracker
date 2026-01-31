import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tennessee Power Outage Tracker | American Red Cross",
  description: "Real-time power outage tracking for all 95 Tennessee counties during winter storms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <nav className="bg-rc-red text-white p-4">
          <div className="container mx-auto flex items-center">
            <div className="flex items-center">
              <div className="text-3xl font-bold mr-3">+</div>
              <h1 className="text-2xl font-bold">TN Power Outage Tracker</h1>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
