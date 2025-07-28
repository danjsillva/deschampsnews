import type { Metadata } from "next";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";

import "./globals.css";
import Sidebar from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Deschamps News",
  description: "Newsletter do Filipe Deschamps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="w-full min-h-screen flex justify-center gap-9 antialiased">
        <aside className="w-[24rem] flex-shrink-0">
          <Suspense fallback={<div>Carregando...</div>}>
            <Sidebar />
          </Suspense>
        </aside>

        <main className="w-[36rem] overflow-y-auto py-6">{children}</main>

        <ToastContainer position="bottom-left" hideProgressBar={true} />
      </body>
    </html>
  );
}
