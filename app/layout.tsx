import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import { DoughStoreProvider } from "@/lib/store";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "600"],
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  weight: ["400", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dough Jo — Sourdough bread in Santa Rosa Beach, FL",
  description:
    "Long-fermented sourdough made in small batches with organic ingredients. Order online, pick up locally in Santa Rosa Beach and the 30A area.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        <DoughStoreProvider>{children}</DoughStoreProvider>
      </body>
    </html>
  );
}
