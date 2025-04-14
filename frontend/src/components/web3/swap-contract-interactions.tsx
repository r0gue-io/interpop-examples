'use client'

import { FC, useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { swapUsdtOnHydrationTx } from '@/transactions'
import { zodResolver } from '@hookform/resolvers/zod'
import { testParasPaseo, testParasPaseoCommon } from '@polkadot/apps-config'
import { EndpointOption } from '@polkadot/apps-config/endpoints/types'
import { formatBalance } from '@polkadot/util'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import { WalletIcon } from 'lucide-react'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAccount } from '@/hooks/useAccount'
import { useAssetHubTokenAccount } from '@/hooks/useAssetHubTokenAccount'

import ChainSelector from '../ui/chain-selector'

const formSchema = z.object({
  amountOut: z.number().optional(),
  destinationBeneficiary: z.string(),
  sentPaseo: z.number().optional(),
})

const USDT = 1984
const USDC = 1337

export const SwapContractInteractions: FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointOption>(testParasPaseoCommon[0])
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Swap)
  const assetHubUsdt = useAssetHubTokenAccount(USDT, activeAccount?.address)
  const assetHubUsdc = useAssetHubTokenAccount(USDC, activeAccount?.address)
  const { popAccountBalance } = useAccount()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { register, handleSubmit } = form

  const swapHandler: SubmitHandler<z.infer<typeof formSchema>> = async ({
    amountOut,
    destinationBeneficiary,
    sentPaseo,
  }) => {
    console.log('Here')
    if (!amountOut || !sentPaseo) {
      toast.error('Missing required fields')
      return
    }
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }
    const tx = await swapUsdtOnHydrationTx(
      activeSigner,
      amountOut * 10 ** (assetHubUsdt.metadata?.decimals || 0),
      1_000_000_0000_000_000,
      3_000_000_000,
      {
        type: 'ParachainAccount',
        value: [selectedEndpoint.paraId!, destinationBeneficiary],
      },
      90_000_000_000,
      900_000,
      sentPaseo,
    )
    const unsub = await tx.signAndSend(activeAccount.address, async ({ status }) => {
      console.log('Transaction status', status.type)
      if (status.type === 'BestChainBlockIncluded' || status.type === 'Finalized') {
        toast.success(`Transaction completed at block hash ${status.value.blockHash}`)
        await unsub()
      }
      if (status.type === 'Invalid') {
        toast.error(`Transaction failed at block hash ${status.value.error}`)
      }
    })
  }

  if (!api) return null

  return (
    <>
      <div className="flex max-w-[35rem] grow flex-col gap-4">
        <h2 className="text-center font-mono text-gray-400">Swap USDT on Hydration</h2>
        <Form {...form}>
          <Card>
            <CardContent className="pt-6">
              <FormLabel className="text-base font-bold">Balance</FormLabel>
              <div className="flex gap-3">
                {[
                  { asset: assetHubUsdt, symbol: 'USDT' },
                  { asset: assetHubUsdc, symbol: 'USDC' },
                ].map(({ asset, symbol }) => (
                  <div key={asset.metadata?.symbol}>
                    {asset.metadata && (
                      <div className="flex-center mt-2 flex items-center gap-2">
                        <Button variant={'secondary'} isLoading={!assetHubUsdt.account} size={'sm'}>
                          <h3 className="text-md mr-2">{symbol}</h3>
                          {formatBalance(asset.account?.balance || 0, {
                            decimals: asset.metadata.decimals,
                          })}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <form
                onSubmit={handleSubmit(swapHandler)}
                className="flex flex-col justify-end gap-2"
              >
                <FormItem>
                  <FormLabel className="text-base font-bold">Swap</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <h3 className="mt-2 text-xs">Amount of PAS</h3>
                      <div className="flex-center flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter the amount of PAS to send"
                          disabled={form.formState.isSubmitting}
                          {...register('sentPaseo')}
                        />
                        <Button
                          onClick={() =>
                            form.setValue('sentPaseo', popAccountBalance?.balance?.toNumber() || 0)
                          }
                          variant={'secondary'}
                          size={'sm'}
                        >
                          Max
                        </Button>
                      </div>
                      <h3 className="mt-2 text-xs">Amount of USDT</h3>
                      <div className="flex-center flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter the total amount of USDT swapped"
                          disabled={form.formState.isSubmitting}
                          {...register('amountOut')}
                        />
                      </div>
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
                          disabled={form.formState.isSubmitting}
                          {...register('destinationBeneficiary')}
                        />
                        <Button
                          onClick={() =>
                            form.setValue('destinationBeneficiary', activeAccount?.address || '')
                          }
                          variant={'secondary'}
                          size={'sm'}
                        >
                          <WalletIcon className="mr-2" size={10} /> Current Wallet
                        </Button>
                      </div>
                      <Button
                        type="submit"
                        className="bg-primary font-bold"
                        disabled={form.formState.isSubmitting}
                        isLoading={form.formState.isSubmitting}
                      >
                        Submit
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              </form>
            </CardContent>
          </Card>
        </Form>

        {/* Contract Address */}
        <p className="text-center font-mono text-xs text-gray-600">
          {contract ? contractAddress : 'Loading…'}
        </p>
      </div>
    </>
  )
}
