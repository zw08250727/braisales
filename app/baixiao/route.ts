import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function scriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function getAgentUrls() {
  return {
    customer:
      process.env.CUSTOMER_AGENT_URL ||
      "https://www.100wiser.com/index?agent=db240a797a244f77990329ae780e2b42",
    market:
      process.env.MARKET_AGENT_URL ||
      "https://www.100wiser.com/index?agent=2cb1842ea8984b3b82a457acb7e57d39",
  };
}

export async function GET() {
  const prototypePath = join(process.cwd(), "app/baixiao/prototype.html");
  let html = await readFile(prototypePath, "utf8");
  let bootstrap = {
    user: null as null | { id: string; email?: string; phone?: string },
    intakes: [] as unknown[],
    agentUrls: getAgentUrls(),
  };

  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: intakes } = user
      ? await supabase
          .from("agent_intakes")
          .select(
            "id, agent_key, agent_name, agent_url, form_data, generated_prompt, status, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(20)
      : { data: [] };

    bootstrap = {
      user: user
        ? { id: user.id, email: user.email ?? undefined, phone: user.phone ?? undefined }
        : null,
      intakes: intakes ?? [],
      agentUrls: getAgentUrls(),
    };
  }

  html = html.replace(
    "<script>\n// ======== HERO CANVAS",
    `<script>window.BAIXIAO_BOOTSTRAP=${scriptJson(bootstrap)};</script>\n<script>\n// ======== HERO CANVAS`,
  );

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
