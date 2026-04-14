import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AgentKey = "customer" | "market";

const AGENTS: Record<AgentKey, { name: string; envKey: string; defaultUrl: string }> = {
  customer: {
    name: "找客户",
    envKey: "CUSTOMER_AGENT_URL",
    defaultUrl: "https://www.100wiser.com/index?agent=db240a797a244f77990329ae780e2b42",
  },
  market: {
    name: "市场洞察和策略",
    envKey: "MARKET_AGENT_URL",
    defaultUrl: "https://www.100wiser.com/index?agent=2cb1842ea8984b3b82a457acb7e57d39",
  },
};

function getAgentUrl(agentKey: AgentKey) {
  const agent = AGENTS[agentKey];
  return process.env[agent.envKey] || agent.defaultUrl;
}

function isAgentKey(value: unknown): value is AgentKey {
  return value === "customer" || value === "market";
}

function generatePrompt(agentName: string, formData: Record<string, unknown>) {
  const rows = Object.entries(formData).map(([key, value]) => {
    const normalizedValue = Array.isArray(value) ? value.join("、") : String(value ?? "");
    return `• ${key}: ${normalizedValue}`;
  });

  return `请以「${agentName}」智能体身份执行以下任务。\n\n请基于用户填写的前置表单进行分析，并输出可直接用于业务执行的结果。\n\n表单信息：\n${rows.join("\n") || "• 用户未填写具体条件，请主动追问关键缺失信息。"}`;
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const agentKey = body?.agentKey;
  const formData = body?.formData && typeof body.formData === "object" ? body.formData : {};

  if (!isAgentKey(agentKey)) {
    return NextResponse.json({ error: "Unsupported agent" }, { status: 400 });
  }

  const agent = AGENTS[agentKey];
  const agentUrl = getAgentUrl(agentKey);
  const generatedPrompt =
    typeof body?.generatedPrompt === "string" && body.generatedPrompt.trim()
      ? body.generatedPrompt.trim()
      : generatePrompt(agent.name, formData);

  const { data, error } = await supabase
    .from("agent_intakes")
    .insert({
      user_id: user.id,
      agent_key: agentKey,
      agent_name: agent.name,
      agent_url: agentUrl,
      form_data: formData,
      generated_prompt: generatedPrompt,
      status: "opened",
    })
    .select(
      "id, agent_key, agent_name, agent_url, form_data, generated_prompt, status, created_at",
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
