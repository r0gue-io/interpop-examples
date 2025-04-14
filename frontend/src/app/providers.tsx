'use client'

import { PropsWithChildren } from 'react'

import { getDeployments } from '@/deployments/deployments'
import { UseInkathonProvider } from '@scio-labs/use-inkathon'

import { env } from '@/config/environment'
import { AccountProvider } from '@/hooks/useAccount'

export default function ClientProviders({ children }: PropsWithChildren) {
  return (
    <UseInkathonProvider
      appName="InterPop Hydra Swap"
      connectOnInit={true}
      defaultChain={env.defaultChain}
      deployments={getDeployments()}
    >
      <AccountProvider>{children}</AccountProvider>
    </UseInkathonProvider>
  )
}
