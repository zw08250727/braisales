"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function authRedirect(message: string, next = "/") {
  const safePath = safeNext(next);
  return `/auth?message=${encodeURIComponent(message)}&next=${encodeURIComponent(safePath)}`;
}

export async function signIn(formData: FormData) {
  const next = safeNext(textValue(formData, "next") || "/");

  if (!hasSupabaseEnv()) {
    redirect(authRedirect("Add your Supabase env vars first.", next));
  }

  const email = textValue(formData, "email");
  const password = textValue(formData, "password");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(authRedirect(error.message, next));
  }

  revalidatePath(next);
  redirect(next);
}

export async function signUp(formData: FormData) {
  const next = safeNext(textValue(formData, "next") || "/");

  if (!hasSupabaseEnv()) {
    redirect(authRedirect("Add your Supabase env vars first.", next));
  }

  const email = textValue(formData, "email");
  const password = textValue(formData, "password");
  const supabase = await createSupabaseServerClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "http://localhost:3000";
  const normalizedSiteUrl = siteUrl.startsWith("http")
    ? siteUrl
    : `https://${siteUrl}`;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${normalizedSiteUrl}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(authRedirect(error.message, next));
  }

  redirect(
    authRedirect(
      "Account created. If email confirmation is enabled in Supabase, please verify your inbox before signing in.",
      next,
    ),
  );
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/");
  redirect("/");
}
