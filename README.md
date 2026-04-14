# AI PM Vibecoding Starter

Deploy-first starter for building a real online MVP with:

- Next.js
- Vercel
- Supabase Auth
- Supabase Postgres
- OpenAI API

The first business loop is already defined:

- sign up or sign in
- create a note
- refresh and confirm the note still exists

## 1. Accounts you need

Create these accounts before deployment:

- GitHub: [https://github.com/signup](https://github.com/signup)
- Vercel: [https://vercel.com/signup](https://vercel.com/signup)
- Supabase: [https://supabase.com/dashboard/sign-up](https://supabase.com/dashboard/sign-up)
- OpenAI Platform: [https://platform.openai.com/signup](https://platform.openai.com/signup)

## 2. Local setup

Copy the env template:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
```

Where to find them:

- Supabase dashboard -> Project Settings -> API
- `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
- `Publishable key` or `anon public key` -> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- OpenAI dashboard -> API keys -> create a new key -> `OPENAI_API_KEY`

Important:

- Never put `service_role` in browser code.
- Only store `service_role` in secure server-only environments if you later need admin operations.

## 3. Create the first Supabase table

Open Supabase:

- Project -> SQL Editor
- create a new query
- paste the contents of `supabase/setup.sql`
- run it

This creates:

- the `notes` table
- indexes
- row-level security policies

## 4. Configure Supabase Auth

In Supabase:

- Authentication -> Providers -> Email
- make sure Email auth is enabled

Then open:

- Authentication -> URL Configuration

Add these URLs:

- Site URL:
  - local: `http://localhost:3000`
  - production later: your Vercel production URL or custom domain
- Redirect URLs:
  - `http://localhost:3000/**`
  - `https://your-project.vercel.app/**`
  - `https://*.vercel.app/**`

## 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should be able to:

- open `/auth`
- sign up
- sign in
- create a note
- refresh and still see the note

## 6. Prepare the Git repository

Inside this project:

```bash
git init -b main
git add .
git commit -m "Initial deploy-first starter"
```

## 7. Create the GitHub repository

Suggested repo name:

```text
ai-pm-vibecoding-starter
```

On GitHub:

- click `New repository`
- use the same name
- keep it empty
- do not add README, `.gitignore`, or license

Then connect and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-pm-vibecoding-starter.git
git push -u origin main
```

## 8. Connect GitHub to Vercel

In Vercel:

- Add New -> Project
- import the GitHub repo
- framework preset should detect `Next.js`
- deploy once

Docs:

- [Vercel for GitHub](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Vercel Deployments](https://vercel.com/docs/deployments)

## 9. Add Vercel environment variables

In Vercel:

- Project -> Settings -> Environment Variables

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
```

Recommended:

- add them to `Production`, `Preview`, and `Development`

Redeploy after saving them.

## 10. Online acceptance checklist

After Vercel deployment:

- open the Vercel preview URL
- open `/auth`
- create an account or sign in
- create a note
- refresh the page
- confirm the note still exists

If something fails:

- Vercel -> Deployment -> Functions / Runtime logs
- Supabase -> Logs
- Supabase -> Authentication users
- Supabase -> Table Editor -> `notes`

## 11. Recommended next step

Once this base loop is live, ask AI to build on top of the `notes` object:

- tags
- search
- AI summary
- file attachments via Supabase Storage
- admin dashboard

## 12. Baixiao Agent intake workflow

The Baixiao prototype is available at:

```text
/baixiao
```

It keeps the high-fidelity HTML interactions, but the two live agent entries now use the deployed product loop:

- user signs in with Supabase Auth
- user opens the Market Insight or Find Customer agent form
- form fields are optional
- submitted form data is saved to Supabase in `agent_intakes`
- a structured prompt is generated and copied
- the existing Agent URL opens in a new tab

Run `supabase/setup.sql` again in Supabase SQL Editor before testing this flow online, because it now includes the `agent_intakes` table and RLS policies.

Optional Vercel env vars:

```env
CUSTOMER_AGENT_URL=https://www.100wiser.com/index?agent=db240a797a244f77990329ae780e2b42
MARKET_AGENT_URL=https://www.100wiser.com/index?agent=2cb1842ea8984b3b82a457acb7e57d39
```

If these are not set, the app uses the default URLs above.
