"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new admin dashboard
    router.push("/admin/dashboard");
  }, [router]);

  return null;
}