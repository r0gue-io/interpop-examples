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
  maxAmountIn: z.number().min(1).max(1000000000000000),
  feeAmount: z.number().min(1).max(1000000000000000),
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
    maxAmountIn,
    feeAmount,
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
      maxAmountIn,
      feeAmount,
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
                      <Input
                        type="number"
                        placeholder="Amount of PASEO to send"
                        disabled={form.formState.isSubmitting}
                        {...register('sentPaseo')}
                      />
                      <Input
                        type="number"
                        placeholder="Enter the total amount of USDT swapped (e.g. 1000000)"
                        disabled={form.formState.isSubmitting}
                        {...register('amountOut')}
                      />
                      <Input
                        type="number"
                        placeholder="Enter the max number of PAS consumed (e.g. 100000000000)"
                        disabled={form.formState.isSubmitting}
                        {...register('maxAmountIn')}
                      />
                      <Input
                        type="number"
                        placeholder="Enter the swap fee amount (e.g. 3000000000)"
                        disabled={form.formState.isSubmitting}
                        {...register('feeAmount')}
                      />
                      <Input
                        placeholder="Enter the destination parachain"
                        disabled={form.formState.isSubmitting}
                        {...register('destinationParachain')}
                      />
                      <Input
                        placeholder="Enter the destination beneficiary"
                        disabled={form.formState.isSubmitting}
                        {...register('destinationBeneficiary')}
                      />
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
