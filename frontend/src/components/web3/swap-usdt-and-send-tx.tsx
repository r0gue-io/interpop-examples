'use client'

import { FC, useMemo, useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { testParasPaseo, testParasPaseoCommon } from '@polkadot/apps-config'
import { EndpointOption } from '@polkadot/apps-config/endpoints/types'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import { WalletIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TxUiStatus, useHydrationSAOnAssetHub, useTransaction } from '@/hooks/useTransaction'

import { AssetHubAssetList } from '../ui/assethub-asset-list'
import ChainSelector from '../ui/chain-selector'

export const SwapUsdtAndSendTxInteractions: FC = () => {
  const [amountOut, setAmountOut] = useState<number | undefined>(0)
  const [destinationBeneficiary, setDestinationBeneficiary] = useState<string | undefined>(
    undefined,
  )
  const [sentPaseo, setSentPaseo] = useState<number | undefined>(0)
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointOption>(testParasPaseoCommon[0])
  const { api, activeAccount } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Swap)
  const { handleSwapPAStoUSDT, assetHubUsdt, status } = useTransaction()
  const hydrationSovereign = useHydrationSAOnAssetHub()

  const errorMessage = useMemo(() => {
    if (!amountOut || !hydrationSovereign.sovereignUsdt.account) return undefined
    if (
      hydrationSovereign.sovereignUsdt.account?.balance <
      BigInt(amountOut * 10 ** (assetHubUsdt.metadata?.decimals || 0))
    ) {
      return `Hydration sovereign account on Asset Hub has insufficient balance. Please deposit more USDT to ${hydrationSovereign.address}`
    }
    return undefined
  }, [hydrationSovereign, amountOut])

  if (!api) return null

  return (
    <>
      <div className="flex max-w-[35rem] grow flex-col gap-4">
        <h2 className="font-mono text-gray-400">
          Swap USDT on Hydration and transfer to the destination parachain
        </h2>
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-base font-bold">Wallet Balance</h1>
            <AssetHubAssetList assets={[{ asset: assetHubUsdt, symbol: 'USDT on Hydration' }]} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-base font-bold">Hydration Sovereign Account Balance</h1>
            <p className="mt-3 text-gray-400">
              The sovereign account must have sufficient balance on the destination parachain.
            </p>
            <AssetHubAssetList
              assets={[
                {
                  asset: hydrationSovereign.sovereignUsdt,
                  symbol: 'USDT on Asset Hub',
                },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-base font-bold">Swap and send to parachain</h1>
            <div className="flex flex-col gap-2">
              <h3 className="mt-2 text-xs">Amount of PAS</h3>
              <Input
                type="number"
                min={0}
                placeholder="Enter the amount of PAS to send"
                disabled={status === TxUiStatus.Submitting}
                value={sentPaseo}
                onChange={(e) => setSentPaseo(parseInt(e.target.value))}
              />
              <h3 className="mt-2 text-xs">Amount of USDT</h3>
              <Input
                type="number"
                min={0}
                placeholder="Enter the total amount of USDT swapped"
                disabled={status === TxUiStatus.Submitting}
                onChange={(e) => setAmountOut(parseInt(e.target.value))}
                value={amountOut}
              />
              <h3 className="mt-2 text-xs">Destination Parachain</h3>
              <ChainSelector
                selectedChain={selectedEndpoint}
                setSelectedChain={setSelectedEndpoint}
                chainOptions={[...testParasPaseoCommon, ...testParasPaseo]}
              />
              <h3 className="mt-2 text-xs">Beneficiary</h3>
              <div className="flex-center flex items-center gap-2">
                <Input
                  placeholder="Enter the destination beneficiary"
                  disabled={status === TxUiStatus.Submitting}
                  value={destinationBeneficiary}
                  onChange={(e) => setDestinationBeneficiary(e.target.value)}
                />
                <Button
                  onClick={() => setDestinationBeneficiary(activeAccount?.address || '')}
                  variant={'secondary'}
                  size={'sm'}
                >
                  <WalletIcon className="mr-2" size={10} /> Current Wallet
                </Button>
              </div>
              <Button
                type="submit"
                onClick={() =>
                  handleSwapPAStoUSDT(amountOut || 0, sentPaseo || 0, {
                    type: 'ParachainAccount',
                    /* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
                    value: [selectedEndpoint?.paraId!, destinationBeneficiary || ''],
                  })
                }
                className="mt-2 bg-primary font-bold"
                disabled={
                  status === TxUiStatus.Submitting ||
                  !amountOut ||
                  !sentPaseo ||
                  !selectedEndpoint ||
                  !selectedEndpoint.paraId ||
                  !destinationBeneficiary ||
                  !!errorMessage
                }
                isLoading={status === TxUiStatus.Submitting}
              >
                Submit
              </Button>
              {errorMessage && (
                <p className="text-center font-mono text-xs text-red-400">{errorMessage}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contract Address */}
        <p className="text-center font-mono text-xs text-gray-600">
          {contract ? contractAddress : 'Loading…'}
        </p>
      </div>
    </>
  )
}
