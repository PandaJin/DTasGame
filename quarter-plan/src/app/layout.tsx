import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyclePlan - 周期计划管理",
  description: "帮助你规划周期目标，追踪时间投入，确保重要的事情得到足够的时间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
