# CyclePlan - quarter-plan

这是 CyclePlan 的前端应用，基于 Next.js 15 构建。

## 开发

```bash
npm install
npm run dev        # 启动开发服务器 (http://localhost:3000)
npm run build      # 生产构建
npm run lint       # ESLint 检查
```

## 环境变量

在项目根目录创建 `.env.local`：

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## 部署

项目通过 Vercel 部署，推送到 GitHub 后自动触发。也可使用：

```bash
npx vercel
```

详细部署说明见根目录 README。
