# 国内云部署说明

本项目是 Next.js + Supabase。国内云推荐使用容器方式部署，入口端口为 `3000`。

## 必需环境变量

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SITE_URL=
CUSTOMER_AGENT_URL=https://www.100wiser.com/index?agent=db240a797a244f77990329ae780e2b42
MARKET_AGENT_URL=https://www.100wiser.com/index?agent=2cb1842ea8984b3b82a457acb7e57d39
```

国内云访问域名确定后，把 `NEXT_PUBLIC_SITE_URL` 设置成国内云 HTTPS 地址。

## Docker

```bash
docker build -t braisales:latest .
docker run -p 3000:3000 \
  --env-file .env.production \
  braisales:latest
```

## 注意

- 当前登录验证码为 mock：`888888`。
- 业务数据仍然保存到 Supabase，`supabase/setup.sql` 已包含 `agent_intakes` 表和 RLS。
- 如果目标用户主要在中国大陆，Supabase 海外服务仍可能存在访问延迟；正式生产建议后续迁移 Auth/DB 到国内云数据库或增加国内可用的数据层。
