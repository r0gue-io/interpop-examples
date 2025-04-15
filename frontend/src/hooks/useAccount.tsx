import React, { useContext, useState } from 'react'

import { BalanceData, useInkathon } from '@scio-labs/use-inkathon'

import { SwapAndDepositTxInteractions } from '@/components/web3/swap-and-deposit-tx'
import { SwapAndSendTxInteractions } from '@/components/web3/swap-and-send-tx'
import {
  PASEO_ASSET_HUB_RPC,
  PASEO_HYDRATION_RPC,
  PASEO_POP_RPC,
} from '@/config/get-supported-chains'

import { useBalance } from './useBalance'

export const EXAMPLES = [
  {
    key: 'swap-and-send-to-parachain',
    name: 'Swap and send to parachain',
    page: <SwapAndSendTxInteractions />,
  },
  {
    key: 'swap-and-deposit-to-local-account',
    name: 'Swap and deposit to local account',
    page: <SwapAndDepositTxInteractions />,
  },
]

const AccountContext = React.createContext<
  Partial<{
    popAccountBalance: BalanceData
    assetHubAccountBalance: BalanceData
    hydrationAccountBalance: BalanceData
    selectedExample: string
    setSelectedExample: (s: string) => void
  }>
>({})

export const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const { activeAccount } = useInkathon()
  const [selectedExample, setSelectedExample] = useState<string>(EXAMPLES[0].key || '')
  const popAccountBalance = useBalance(PASEO_POP_RPC, activeAccount?.address, true, {
    forceUnit: false,
    fixedDecimals: 4,
    removeTrailingZeros: true,
  })
  const hydrationAccountBalance = useBalance(PASEO_HYDRATION_RPC, activeAccount?.address, true, {
    forceUnit: false,
    fixedDecimals: 4,
    removeTrailingZeros: true,
  })
  const assetHubAccountBalance = useBalance(PASEO_ASSET_HUB_RPC, activeAccount?.address, true, {
    forceUnit: false,
    fixedDecimals: 4,
    removeTrailingZeros: true,
  })

  return (
    <AccountContext.Provider
      value={{
        popAccountBalance,
        assetHubAccountBalance,
        hydrationAccountBalance,
        selectedExample,
        setSelectedExample,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export const useAccount = () => {
  return useContext(AccountContext)
}
