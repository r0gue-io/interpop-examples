import { address } from '@inkathon/contracts/deployments/swap/pop-network-testnet'
import swapMetadata from '@inkathon/contracts/deployments/swap/swap.json'
import {
  HydraSwapContractApi,
  HydraSwapXcmDepositedLocationLike,
} from '@inkathon/contracts/generated-types/hydra-swap'
import { DedotClient, WsProvider } from 'dedot'
import { Contract } from 'dedot/contracts'
import { AccountNonceApi, TaggedTransactionQueue, TransactionPaymentApi } from 'dedot/runtime-specs'
import { RuntimeApiSpec } from 'dedot/types'

import { PASEO_POP_RPC } from '@/config/get-supported-chains'

export const ContractsApi: RuntimeApiSpec[] = [
  {
    methods: {
      call: {
        docs: 'Perform a call from a specified account to a given contract.',
        params: [],
        type: 'ContractResult',
        codec: undefined,
      },
    },
    version: 2,
  },
]

export const swapUsdtOnHydrationTx = async (
  signer: any,
  amountOut: number,
  maxAmountIn: number,
  feeAmount: number,
  dest: HydraSwapXcmDepositedLocationLike,
  refTime: number,
  proofSize: number,
  sentPaseo: number,
) => {
  const provider = new WsProvider(PASEO_POP_RPC)
  const api = await DedotClient.new<any>({
    provider,
    cacheMetadata: true,
    runtimeApis: { ContractsApi, TaggedTransactionQueue, TransactionPaymentApi, AccountNonceApi },
  })
  api.setSigner(signer)
  const contract = new Contract<HydraSwapContractApi>(api, swapMetadata as any, address)
  return contract.tx.swapUsdtOnHydra(
    BigInt(amountOut),
    BigInt(maxAmountIn),
    BigInt(feeAmount),
    dest,
    {
      gasLimit: {
        refTime: BigInt(refTime),
        proofSize: BigInt(proofSize),
      },
      value: BigInt(sentPaseo),
    },
  )
}
