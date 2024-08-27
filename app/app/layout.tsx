"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { WalletProvider } from "./WalletContext";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
        <ThirdwebProvider clientId="5101ab374c610f458813c8583fffa1da">
          <WalletProvider>
            {children}
          </WalletProvider>
        </ThirdwebProvider>
        </Providers>
      </body>
    </html>
  );
}