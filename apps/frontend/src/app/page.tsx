import { LandingPage } from "@/features/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Криптовалютные операции через OnlyP2P",
  description: "Пополнение, реквизиты, входящие заявки и поддержка через инфраструктуру OnlyP2P.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <LandingPage />;
}
