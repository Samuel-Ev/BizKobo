"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStoredToken } from "@/lib/api";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = loadStoredToken();
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-copper-light to-copper-dark animate-pulse" />
    </div>
  );
}
