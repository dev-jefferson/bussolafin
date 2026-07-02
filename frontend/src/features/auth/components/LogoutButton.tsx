"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLogout } from "../hooks";

export function LogoutButton() {
  const router = useRouter();
  const logout = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={logout.isPending}
      onClick={() =>
        logout.mutate(undefined, {
          onSuccess: () => {
            router.push("/login");
            router.refresh();
          },
        })
      }
    >
      Sair
    </Button>
  );
}
