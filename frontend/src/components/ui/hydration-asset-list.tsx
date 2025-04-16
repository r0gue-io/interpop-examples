import React from 'react'

import {
  OrmlTokensAccountData,
  PalletAssetRegistryAssetDetails,
} from '@inkathon/contracts/generated-types/chains/hydradx'
import { formatBalance } from '@polkadot/util'

import { Button } from './button'

export const HydrationAssetList = ({
  assets,
}: {
  assets: {
    symbol: string
    asset: {
      details: PalletAssetRegistryAssetDetails | undefined
      account: OrmlTokensAccountData | undefined
    }
  }[]
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {assets.map(({ asset, symbol }) => (
        <div key={asset.details?.symbol}>
          <div className="flex-center mt-2 flex items-center gap-2">
            <Button variant={'secondary'} isLoading={!asset.account} size={'sm'}>
              {asset.details && (
                <React.Fragment>
                  <h3 className="text-md mr-2">{symbol}</h3>
                  <div className="font-bold text-purple-300">
                    {formatBalance(asset.account?.free || 0, {
                      decimals: asset.details.decimals,
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
