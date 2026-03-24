"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getRootUrl } from "@/lib/tenant";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(getRootUrl("/login"));
}
