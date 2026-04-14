import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MOCK_CODE = "888888";

function normalizePhone(value: unknown) {
  const phone = String(value ?? "").trim().replace(/\s+/g, "");

  if (/^1[3-9]\d{9}$/.test(phone)) {
    return `+86${phone}`;
  }

  return phone;
}

function phoneEmail(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `phone-${digits}@mock.braisales.app`;
}

function phonePassword(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `BraisalesMock-${digits}-2026!`;
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env vars are missing" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const phone = normalizePhone(body?.phone);
  const token = String(body?.token ?? "").trim();

  if (!/^\+\d{8,15}$/.test(phone) || !token) {
    return NextResponse.json({ error: "请填写手机号和验证码" }, { status: 400 });
  }

  if (token !== MOCK_CODE) {
    return NextResponse.json({ error: "验证码不正确，测试验证码为 888888" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const email = phoneEmail(phone);
  const password = phonePassword(phone);
  const signInResult = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  let user = signInResult.data.user;
  let session = signInResult.data.session;
  let error = signInResult.error;

  if (error && /invalid login credentials/i.test(error.message)) {
    const signUpResult = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone,
          auth_method: "mock_phone_otp",
        },
      },
    });

    user = signUpResult.data.user;
    session = signUpResult.data.session;
    error = signUpResult.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!session) {
    return NextResponse.json(
      {
        error:
          "账号已创建，但 Supabase 邮箱注册需要确认。请在 Supabase Auth 中关闭 Confirm email，或预先确认该 mock 账号。",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    user: user
      ? { id: user.id, email: user.email, phone }
      : null,
  });
}
