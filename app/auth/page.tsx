import Link from "next/link";
import { signIn, signUp } from "@/app/actions";
import { hasSupabaseEnv } from "@/lib/env";
import { PhoneAuthForm } from "./phone-auth-form";

type AuthPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = searchParams ? await searchParams : {};
  const message = readMessage(params.message);
  const next = readMessage(params.next) || "/baixiao";
  const ready = hasSupabaseEnv();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-5 py-8">
      <Link
        href="/baixiao"
        className="w-fit text-sm font-medium text-stone-600 transition hover:text-stone-950"
      >
        返回百销智能体平台
      </Link>

      <section className="grid gap-6 rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(30,41,59,0.12)] sm:p-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Supabase Auth
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
              登录百销智能体平台
            </h1>
            <p className="max-w-xl text-base leading-7 text-stone-600">
              第一版保留 Supabase Auth，支持邮箱密码和手机号短信验证码登录。登录后才能提交
              Agent 前置表单，并只能读取自己的业务记录。
            </p>
          </div>

          <div className="rounded-2xl bg-stone-950 p-6 text-sm leading-6 text-stone-300">
            <p className="font-semibold uppercase tracking-[0.24em] text-emerald-300">
              上线前确认
            </p>
            <ul className="mt-4 space-y-3">
              <li>1. 在 Supabase 启用 Email provider。</li>
              <li>2. 在 Supabase 启用 Phone provider，并配置短信服务商。</li>
              <li>3. 将 Vercel Production / Preview URL 加入 Auth redirect URLs。</li>
              <li>4. 执行 `supabase/setup.sql`，确保业务表开启 RLS。</li>
            </ul>
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
          {!ready ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Supabase 环境变量缺失。请先配置 `NEXT_PUBLIC_SUPABASE_URL` 与
              `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`。
            </div>
          ) : null}

          {message ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              {message}
            </div>
          ) : null}

          {ready ? <PhoneAuthForm next={next} /> : null}

          <div className="h-px bg-stone-200" />

          <form action={signIn} className="space-y-4">
            <input name="next" type="hidden" value={next} />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-stone-950">邮箱密码登录</h2>
              <p className="text-sm text-stone-600">使用已有邮箱账号登录。</p>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-stone-700">邮箱</span>
              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-emerald-500"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-stone-700">密码</span>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-emerald-500"
                placeholder="至少 6 位"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!ready}
            >
              邮箱登录
            </button>
          </form>

          <div className="h-px bg-stone-200" />

          <form action={signUp} className="space-y-4">
            <input name="next" type="hidden" value={next} />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-stone-950">创建邮箱账号</h2>
              <p className="text-sm text-stone-600">用邮箱密码注册一个新账号。</p>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-stone-700">邮箱</span>
              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-emerald-500"
                placeholder="founder@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-stone-700">密码</span>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-emerald-500"
                placeholder="至少 6 位"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!ready}
            >
              创建账号
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
