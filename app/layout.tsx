import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "百销智能体平台",
  description:
    "基于 Next.js 与 Supabase 的企业营销智能体平台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">
        <div className="min-h-screen bg-[#f7f7f4]">{children}</div>
      </body>
    </html>
  );
}
