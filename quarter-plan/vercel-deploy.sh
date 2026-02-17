#!/bin/bash
# QuarterPlan Vercel 部署脚本

echo "🚀 开始部署 QuarterPlan 到 Vercel..."
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

# 切换到项目目录
cd "$(dirname "$0")"

echo ""
echo "🔐 请登录 Vercel（会打开浏览器）..."
vercel login

echo ""
echo "📤 开始部署..."
echo "提示：选择项目名称时可以用默认值"
echo "提示：环境变量会在部署后在 Vercel Dashboard 添加"
echo ""

# 首次部署
vercel

echo ""
echo "✅ 预览部署完成！"
echo ""
echo "💡 下一步："
echo "1. 访问 Vercel Dashboard: https://vercel.com/dashboard"
echo "2. 找到你的项目 → Settings → Environment Variables"
echo "3. 添加以下环境变量："
echo "   NEXT_PUBLIC_SUPABASE_URL=https://yjuwqytxvtuvizqkzrkc.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_L1OufRGiCY4Y9fpdNBLfhg_h4zUUD7T"
echo "4. 然后运行: vercel --prod"
echo ""
