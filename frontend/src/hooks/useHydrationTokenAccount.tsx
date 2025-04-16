import { useEffect, useState } from 'react'

import { createApi } from '@/transactions'
import {
  HydradxApi,
  OrmlTokensAccountData,
  PalletAssetRegistryAssetDetails,
} from '@inkathon/contracts/generated-types/chains/hydradx'

export const useHydrationTokenAccount = (
  wss: string,
  assetId: number,
  address: string | undefined,
) => {
  const [details, setDetails] = useState<PalletAssetRegistryAssetDetails | undefined>(undefined)
  const [account, setAccount] = useState<OrmlTokensAccountData | undefined>(undefined)
  useEffect(() => {
    const init = async () => {
      if (!address) return
      const client = await createApi<HydradxApi>(wss)
      const details = await client.query.assetRegistry.assets(assetId)
      if (details) {
        setDetails(details)
        await client.query.tokens.accounts([address, assetId], (d) => {
          if (d) {
            setAccount(d)
          }
        })
      }
    }
    init()
  }, [address, assetId])
  return { account, details }
}
