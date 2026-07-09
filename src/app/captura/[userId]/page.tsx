import CapturaForm from './CapturaForm'

interface Props {
  params: Promise<{ userId: string }>
}

export default async function CapturaPage({ params }: Props) {
  const { userId } = await params
  return <CapturaForm userId={userId} />
}
