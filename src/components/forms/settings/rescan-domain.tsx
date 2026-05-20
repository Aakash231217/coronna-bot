'use client'

import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { useToast } from '@/components/ui/use-toast'
import { onRescanDomain } from '@/actions/settings'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  domainId: string
}

const RescanDomain = ({ domainId }: Props) => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const onClick = async () => {
    try {
      setLoading(true)
      const result = await onRescanDomain(domainId)
      toast({
        title: result?.status === 200 ? 'Success' : 'Error',
        description: result?.message ?? 'Unable to scan website',
      })
      if (result?.status === 200) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500">
        Re-scan the website to refresh the AI knowledge base used by the chatbot.
      </p>
      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={onClick}
      >
        <Loader loading={loading}>Re-scan website</Loader>
      </Button>
    </div>
  )
}

export default RescanDomain
