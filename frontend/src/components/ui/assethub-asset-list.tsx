import React from 'react'

import { formatBalance } from '@polkadot/util'
import { PalletAssetsAssetAccount, PalletAssetsAssetMetadata } from 'dedot/chaintypes'

import { Button } from './button'

export const AssetHubAssetList = ({
  assets,
}: {
  assets: {
    symbol: string
    asset: {
      metadata: PalletAssetsAssetMetadata | undefined
      account: PalletAssetsAssetAccount | undefined
    }
  }[]
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {assets.map(({ asset, symbol }) => (
        <div key={asset.metadata?.symbol}>
          <div className="flex-center mt-2 flex items-center gap-2">
            <Button variant={'secondary'} isLoading={!asset.account} size={'sm'}>
              {asset.metadata && (
                <React.Fragment>
                  <h3 className="text-md mr-2">{symbol}</h3>
                  <div className="font-bold text-purple-300">
                    {formatBalance(asset.account?.balance || 0, {
                      decimals: asset.metadata.decimals,
                    })}
                  </div>
                </React.Fragment>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
