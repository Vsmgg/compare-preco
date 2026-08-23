import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://compare-preco.vercel.app"),
  title: {
    default: "Compare Preço — Encontre o melhor preço na internet",
    template: "%s · Compare Preço",
  },
  description:
    "Compare preços, avaliações, entrega e confiabilidade de produtos encontrados na internet com inteligência artificial.",
  openGraph: {
    title: "Compare Preço — Encontre o melhor preço na internet",
    description:
      "A IA pesquisa a internet, compara preços, avaliações, entrega e confiabilidade para encontrar as melhores opções para você.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">{children}</body>
    </html>
  );
}
