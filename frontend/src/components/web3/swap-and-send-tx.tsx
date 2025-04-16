'use client'

import { FC, useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { testParasPaseo, testParasPaseoCommon } from '@polkadot/apps-config'
import { EndpointOption } from '@polkadot/apps-config/endpoints/types'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import { WalletIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PASEO_HYDRATION_RPC } from '@/config/get-supported-chains'
import { useHydrationTokenAccount } from '@/hooks/useHydrationTokenAccount'
import { TxUiStatus, useTransaction } from '@/hooks/useTransaction'
import { hexToString } from '@/utils/string'

import ChainSelector from '../ui/chain-selector'
import { HydrationAssetList } from '../ui/hydration-asset-list'

const PASEO_POP_PARACHAIN_ID = 4001

export const SwapAndSendTxInteractions: FC = () => {
  const [assetInId, setAssetInId] = useState<number>(5)
  const [assetOutId, setAssetOutId] = useState<number>(10)
  const [amountOut, setAmountOut] = useState<number | undefined>(0)
  const [destinationBeneficiary, setDestinationBeneficiary] = useState<string | undefined>(
    undefined,
  )
  const [sentPaseo, setSentPaseo] = useState<number | undefined>(0)
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointOption>(testParasPaseoCommon[0])
  const { api, activeAccount } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Swap)
  const { handleSwapAny, assetHubUsdt, status } = useTransaction()
  const hydrationAssetInAccount = useHydrationTokenAccount(
    PASEO_HYDRATION_RPC,
    assetInId,
    activeAccount?.address,
  )
  const hydrationAssetOutAccount = useHydrationTokenAccount(
    PASEO_HYDRATION_RPC,
    assetOutId,
    activeAccount?.address,
  )

  if (!api) return null

  return (
    <>
      <div className="flex max-w-[35rem] grow flex-col gap-4">
        <h2 className="font-mono text-gray-400">
          Swap any token on Hydration and transfer to the destination parachain.
        </h2>
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-base font-bold">Wallet Balance on Hydration</h1>
            <HydrationAssetList
              assets={[
                {
                  asset: hydrationAssetInAccount,
                  symbol: `${hexToString(hydrationAssetInAccount.details?.symbol)}`,
                },
                {
                  asset: hydrationAssetOutAccount,
                  symbol: `${hexToString(hydrationAssetOutAccount.details?.symbol)}`,
                },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-base font-bold">Swap and send to parachain</h1>
            <br />
            <p className="text-gray-300">
              Ensure asset transferred to intermediary parachain is reserved with sufficient fund.
            </p>
            <br />
            <div className="flex flex-col gap-2">
              <h3 className="mt-2 text-xs">In Asset ID</h3>
              <Input
                type="number"
                min={0}
                placeholder="Enter the input asset ID"
                disabled={status === TxUiStatus.Submitting}
                onChange={(e) => setAssetInId(parseInt(e.target.value))}
                value={assetInId}
              />
              <h3 className="mt-2 text-xs">Amount Input</h3>
              <Input
                type="number"
                min={0}
                placeholder="Enter the amount of PAS"
                disabled={status === TxUiStatus.Submitting}
                value={sentPaseo}
                onChange={(e) => setSentPaseo(parseInt(e.target.value))}
              />
              <h3 className="mt-2 text-xs">Out Asset ID</h3>
              <Input
                type="number"
                min={0}
                placeholder="Enter the output asset ID"
                disabled={status === TxUiStatus.Submitting}
                onChange={(e) => setAssetOutId(parseInt(e.target.value))}
                value={assetOutId}
              />
              <h3 className="mt-2 text-xs">Maximum amount out</h3>
              <Input
                type="number"
                min={0}
                placeholder="Enter the total amount of ouput asset"
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
                  handleSwapAny(
                    PASEO_POP_PARACHAIN_ID,
                    selectedEndpoint.paraId,
                    assetInId,
                    assetOutId,
                    amountOut,
                    sentPaseo,
                    {
                      type: 'ParachainAccount',
                      /* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
                      value: [selectedEndpoint?.paraId!, destinationBeneficiary || ''],
                    },
                  )
                }
                className="mt-2 bg-primary font-bold"
                disabled={
                  status === TxUiStatus.Submitting ||
                  !assetInId ||
                  !assetOutId ||
                  !sentPaseo ||
                  !amountOut ||
                  !selectedEndpoint ||
                  !selectedEndpoint.paraId ||
                  !destinationBeneficiary
                }
                isLoading={status === TxUiStatus.Submitting}
              >
                Submit
              </Button>
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
