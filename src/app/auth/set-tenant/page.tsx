"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function SetTenant() {
  const params = useSearchParams();
  const slug = params.get("slug");

  useEffect(() => {
    if (slug) {
      document.cookie = `tenant=${slug}; path=/; samesite=lax`;
      window.location.href = "/";
    } else {
      window.location.href = "/login";
    }
  }, [slug]);

  return <p className="p-8 text-center text-muted-foreground">Redirecting...</p>;
}

export default function SetTenantPage() {
  return (
    <Suspense>
      <SetTenant />
    </Suspense>
  );
}
