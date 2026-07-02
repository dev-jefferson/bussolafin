import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="grid gap-4">
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/register" className="underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
