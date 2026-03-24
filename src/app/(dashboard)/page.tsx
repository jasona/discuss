"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSpacesWithPages, type SpaceWithPages } from "@/lib/actions/spaces";

export default function DashboardHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function redirectToFirstSpace() {
      const spaces = await getSpacesWithPages();
      if (spaces.length > 0) {
        router.replace(`/${spaces[0].id}`);
      } else {
        setLoading(false);
      }
    }
    redirectToFirstSpace();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Welcome to Discuss</h1>
      <p className="text-muted-foreground">
        Create your first space from the sidebar to get started.
      </p>
    </div>
  );
}
