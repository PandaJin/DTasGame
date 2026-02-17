import { redirect } from 'next/navigation'

interface CycleDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CycleDetailPage({ params }: CycleDetailPageProps) {
  const { id } = await params
  redirect(`/dashboard/cycles?id=${id}`)
}
