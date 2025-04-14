'use client'

import { FC } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { swapUsdtOnHydrationTx } from '@/transactions'
import { zodResolver } from '@hookform/resolvers/zod'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  amountOut: z.number().min(1).max(10000000),
  destinationParachain: z.number(),
  destinationBeneficiary: z.string(),
  sentPaseo: z.number(),
})

export const SwapContractInteractions: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Swap)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { register, handleSubmit } = form

  const swapHandler: SubmitHandler<z.infer<typeof formSchema>> = async ({
    amountOut,
    destinationBeneficiary,
    destinationParachain,
    sentPaseo,
  }) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    const tx = await swapUsdtOnHydrationTx(
      activeSigner,
      amountOut,
      1_000_000_0000_000_000,
      3_000_000_000,
      {
        type: 'ParachainAccount',
        value: [destinationParachain, destinationBeneficiary],
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
        <h2 className="text-center font-mono text-gray-400">Swap Smart Contract</h2>

        <Form {...form}>
          {/* Update Greeting */}
          <Card>
            <CardContent className="pt-6">
              <form
                onSubmit={handleSubmit(swapHandler)}
                className="flex flex-col justify-end gap-2"
              >
                <FormItem>
                  <FormLabel className="text-base">Swap USDT on Hydration</FormLabel>
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
                        <Button variant={'secondary'} size={'sm'}>
                          Max
                        </Button>
                      </div>
                      <h3 className="mt-2 text-xs">Amount of USDT</h3>
                      <div className="flex-center flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter the total amount of USDT swapped (e.g. 1000000)"
                          disabled={form.formState.isSubmitting}
                          {...register('amountOut')}
                        />
                      </div>
                      <h3 className="mt-2 text-xs">Destination Parachain</h3>
                      <Input
                        placeholder="Enter the destination parachain"
                        type="number"
                        min={1000}
                        disabled={form.formState.isSubmitting}
                        {...register('destinationParachain')}
                      />
                      <h3 className="mt-2 text-xs">Beneficiary</h3>
                      <div className="flex-center flex items-center gap-2">
                        <Input
                          placeholder="Enter the destination beneficiary"
                          disabled={form.formState.isSubmitting}
                          {...register('destinationBeneficiary')}
                        />
                        <Button variant={'secondary'} size={'sm'}>
                          Current Wallet
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
