import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

const NAV_LINKS = [
  { href: "/budgets", label: "Orçamentos" },
  { href: "/categories", label: "Categorias" },
  { href: "/comparison", label: "Comparativo" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/budgets" className="font-semibold">
            Controle Financeiro
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
