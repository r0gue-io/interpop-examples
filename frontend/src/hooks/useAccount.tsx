import React, { useContext } from 'react'

import { BalanceData, useInkathon } from '@scio-labs/use-inkathon'

import {
  PASEO_ASSET_HUB_RPC,
  PASEO_HYDRATION_RPC,
  PASEO_POP_RPC,
} from '@/config/get-supported-chains'

import { useBalance } from './useBalance'

const AccountContext = React.createContext<
  Partial<{
    popAccountBalance: BalanceData
    assetHubAccountBalance: BalanceData
    hydrationAccountBalance: BalanceData
  }>
>({})

export const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const { activeAccount } = useInkathon()
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
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export const useAccount = () => {
  return useContext(AccountContext)
}
