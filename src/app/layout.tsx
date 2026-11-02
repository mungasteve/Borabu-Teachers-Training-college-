import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import AiAdvisorWidget from "@/components/AiAdvisorWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://borabu-teachers-training-college-fiom.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    template: "%s | Borabu Teachers Training College",
    default: "Borabu Teachers Training College | Admissions & Teacher Education",
  },
  description:
    "Admissions portal, programme catalog, applicant dashboard, and letter verification for Borabu Teachers Training College (BTTC).",
  keywords: [
    "Borabu TTC",
    "Teachers College Kenya",
    "DPTE",
    "DECTE",
    "CECTE",
    "Teacher Training Nyamira",
  ],
  openGraph: {
    title: "Borabu Teachers Training College",
    description:
      "Admissions portal, programme catalog, applicant dashboard, and letter verification for Borabu Teachers Training College (BTTC).",
    type: "website",
    images: [
      {
        url: "/images/campus-hero.jpg",
        width: 1280,
        height: 720,
        alt: "Borabu Teachers Training College Campus in Nyamira County",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className={inter.className}>
        <ToastProvider>
          {children}
          <AiAdvisorWidget />
        </ToastProvider>
      </body>
    </html>
  );
}
