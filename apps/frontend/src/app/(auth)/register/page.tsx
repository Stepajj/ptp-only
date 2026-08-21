import { AuthCard } from "@/components/auth/AuthCard/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация",
  description: "Создание аккаунта ONLYp2p.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return <>
    <AuthCard >
    <RegisterForm></RegisterForm>
    
    </AuthCard>
  </>;
}
