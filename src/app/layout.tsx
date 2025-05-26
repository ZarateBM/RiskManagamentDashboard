import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/ui/footer";
import { AuthProvider } from "@/context/AuthContext";

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
        <AuthProvider>
          <div className="body">
            <header>
              <Nav />
            </header>
            <main>{children}</main>
            <footer>
              <Footer />
            </footer>
          </div>
          
        </AuthProvider>
         
      </body>
    </html>
  );
}
