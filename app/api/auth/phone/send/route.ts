import { NextResponse } from "next/server";

function normalizePhone(value: unknown) {
  const phone = String(value ?? "").trim().replace(/\s+/g, "");

  if (/^1[3-9]\d{9}$/.test(phone)) {
    return `+86${phone}`;
  }

  return phone;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phone = normalizePhone(body?.phone);

  if (!/^\+\d{8,15}$/.test(phone)) {
    return NextResponse.json({ error: "手机号需要包含国家区号，或填写中国大陆 11 位手机号" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, phone, message: "测试验证码为 888888" });
}
