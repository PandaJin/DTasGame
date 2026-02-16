import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Target, BarChart3, CheckCircle } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Target,
      title: '季度目标规划',
      description: '设定 3-4 个季度核心任务，明确优先级，聚焦真正重要的事情',
    },
    {
      icon: Clock,
      title: '时间追踪',
      description: '通过计时器或手动记录，精确追踪每项任务的时间投入',
    },
    {
      icon: BarChart3,
      title: '数据分析',
      description: '可视化进度报告，优先级对齐分析，确保时间分配与目标一致',
    },
    {
      icon: CheckCircle,
      title: '进度预测',
      description: '基于历史数据预测完成日期，及时发现风险并调整策略',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold">QuarterPlan</div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">登录</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">免费注册</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          让时间投入与<span className="text-primary">优先级对齐</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          QuarterPlan 帮助你规划季度目标，追踪时间投入，确保重要的事情得到足够的时间。
          告别忙碌却无成效的日子。
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/signup">开始使用</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">已有账户？登录</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">你是否也有这样的困扰？</h2>
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-red-500">✗</span>
                每天忙碌，但季度结束时重要目标却没有完成
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500">✗</span>
                紧急的事情不断打断，真正重要的事情被搁置
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500">✗</span>
                不清楚时间都花在了哪里，感觉失去控制
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500">✗</span>
                缺乏对进度的可见性，临近截止才发现来不及
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">QuarterPlan 帮你解决</h2>
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-green-500">✓</span>
                明确季度内最重要的 3-4 项任务并设置优先级
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500">✓</span>
                追踪每日时间投入，确保高优先级任务得到足够关注
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500">✓</span>
                可视化时间分配，发现时间与优先级的偏离
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500">✓</span>
                预测完成日期，及时调整计划避免延期
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">准备好开始了吗？</h2>
        <p className="text-xl text-muted-foreground mb-8">
          免费创建账户，开始规划你的季度目标
        </p>
        <Button size="lg" asChild>
          <Link href="/signup">立即开始</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 QuarterPlan. 让时间投入与优先级对齐。</p>
        </div>
      </footer>
    </div>
  )
}
