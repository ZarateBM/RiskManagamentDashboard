import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Gestión de Riesgos - Cuarto de Comunicaciones",
  description: "Dashboard para monitoreo y gestión de riesgos en el cuarto de comunicaciones",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-16 items-center px-4 bg-primary-blue">
          <img src="firma-tipografica-ucr.svg" alt="Logo UCR" />
        </div>
        {children}
        <footer className="flex items-center justify-between border-t p-4 bg-gray">
        <div className="flex items-center gap-2">
          <img src="firma-tipografica-ucr.svg" alt="Logo UCR" className="h-8" />
          <h6 className="text-sm text-white">Sistema de Gestión de Riesgos - Cuarto de Comunicaciones</h6>
        </div>
      </footer>
      </body>
    </html>
  );
}
