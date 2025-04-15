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
import { TxUiStatus, useTransaction } from '@/hooks/useTransaction'

import ChainSelector from '../ui/chain-selector'

const POP_PARACHAIN_ID = 4001

export const FundParachainTx: FC = () => {
  const [paraEndpoint, setParaEndpoint] = useState<EndpointOption>(testParasPaseoCommon[0])
  const [destinationBeneficiary, setDestinationBeneficiary] = useState<string | undefined>(
    undefined,
  )
  const [sentPaseo, setSentPaseo] = useState<number | undefined>(0)
  const { api, activeAccount } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Swap)
  const { handleDirectReserveTransferParachain, status } = useTransaction()

  if (!api) return null

  return (
    <>
      <div className="flex max-w-[35rem] grow flex-col gap-4">
        <h2 className="font-mono text-gray-400">Reseve transferring PAS to the parachain</h2>
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-base font-bold">Transfer</h1>
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
              <h3 className="mt-2 text-xs">Destination Parachain</h3>
              <ChainSelector
                selectedChain={paraEndpoint}
                setSelectedChain={setParaEndpoint}
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
                  handleDirectReserveTransferParachain(
                    POP_PARACHAIN_ID,
                    paraEndpoint.paraId,
                    destinationBeneficiary,
                    false,
                    sentPaseo,
                  )
                }
                className="mt-2 bg-primary font-bold"
                disabled={status === TxUiStatus.Submitting || !sentPaseo || !destinationBeneficiary}
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
