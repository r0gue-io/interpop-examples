'use client'

import { useEffect } from 'react'

import { useInkathon } from '@scio-labs/use-inkathon'
import { toast } from 'react-hot-toast'

import { HomePageTitle } from '@/app/components/home-page-title'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { PageSelector } from '@/components/ui/page-selector'
import { ChainInfo } from '@/components/web3/chain-info'
import { ConnectButton } from '@/components/web3/connect-button'

export default function HomePage() {
  // Display `useInkathon` error messages (optional)
  const { api } = useInkathon()
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  return (
    <>
      <div className="container relative flex grow flex-col items-center justify-center py-10">
        <AnimatedBackground />

        {/* Title */}
        <HomePageTitle />

        {/* Connect Wallet Button */}
        <ConnectButton />

        {api && (
          <div className="mt-12 flex w-full flex-wrap items-start justify-center gap-4">
            {/* Chain Metadata Information */}
            <ChainInfo />

            <div>
              <PageSelector />
              <br />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
