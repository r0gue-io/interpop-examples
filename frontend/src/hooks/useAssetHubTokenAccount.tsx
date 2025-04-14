import { useEffect, useState } from 'react'

import {
  AssetHubPaseoApi,
  PalletAssetsAssetMetadata,
} from '@inkathon/contracts/generated-types/chains/asset-hub-paseo'
import { DedotClient, WsProvider } from 'dedot'
import { PalletAssetsAssetAccount } from 'dedot/chaintypes'

import { PASEO_ASSET_HUB_RPC } from '@/config/get-supported-chains'

export const useAssetHubTokenAccount = (assetId: number, address: string | undefined) => {
  const [metadata, setMeadata] = useState<PalletAssetsAssetMetadata | undefined>(undefined)
  const [account, setAccount] = useState<PalletAssetsAssetAccount | undefined>(undefined)
  useEffect(() => {
    const init = async () => {
      if (!address) return
      const provider = new WsProvider(PASEO_ASSET_HUB_RPC)
      const client = await DedotClient.create<AssetHubPaseoApi>({
        provider,
      })
      const metatadataData = await client.query.assets.metadata(assetId)
      if (metatadataData) {
        setMeadata(metatadataData)
        const accountData = await client.query.assets.account([assetId, address])
        setAccount(accountData)
      }
    }
    init()
  }, [address, assetId])
  return { account, metadata }
}
