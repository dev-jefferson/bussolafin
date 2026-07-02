import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="grid gap-4">
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </div>
  );
}
