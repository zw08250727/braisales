"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function PhoneAuthForm({ next }: { next: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("请输入带国家区号的手机号，例如 +8613800000000。");

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedPhone = phone.trim().replace(/\s+/g, "");

    if (!normalizedPhone.startsWith("+")) {
      setMessage("手机号需要包含国家区号，例如中国大陆手机号请填写 +86。");
      return;
    }

    setPending(true);
    setMessage("正在发送短信验证码...");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
    });

    setPending(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPhone(normalizedPhone);
    setSent(true);
    setMessage("验证码已发送。请查看手机短信，并在下方输入 6 位验证码。");
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedPhone = phone.trim().replace(/\s+/g, "");
    const token = code.trim();

    if (!normalizedPhone || token.length < 4) {
      setMessage("请填写手机号和短信验证码。");
      return;
    }

    setPending(true);
    setMessage("正在验证短信验证码...");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token,
      type: "sms",
    });

    setPending(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-stone-950">手机号登录</h2>
        <p className="text-sm leading-6 text-stone-600">
          使用 Supabase Phone Auth 发送真实短信验证码。上线前请在 Supabase 中配置短信服务商。
        </p>
      </div>

      <form onSubmit={sendCode} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">手机号</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            name="phone"
            type="tel"
            inputMode="tel"
            required
            className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-emerald-500"
            placeholder="+8613800000000"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sent ? "重新发送验证码" : "发送验证码"}
        </button>
      </form>

      {sent ? (
        <form onSubmit={verifyCode} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">短信验证码</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-emerald-500"
              placeholder="6 位验证码"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            验证并登录
          </button>
        </form>
      ) : null}

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
        {message}
      </div>
    </div>
  );
}
