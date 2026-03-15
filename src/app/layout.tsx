import type { Metadata } from "next";
import { Exo_2, Rajdhani, Syne } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const exo = Exo_2({
  variable: "--font-exo",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM-IT | Sistema de Administracion y Gestion",
  description:
    "Sistema interno para gestionar clientes, productos, pagos y soporte de IT Integral Solution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${exo.variable} ${rajdhani.variable} ${syne.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
