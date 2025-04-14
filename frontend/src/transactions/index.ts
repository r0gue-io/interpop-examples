import { address } from '@inkathon/contracts/deployments/swap/pop-network-testnet'
import swapMetadata from '@inkathon/contracts/deployments/swap/swap.json'
import {
  HydraSwapContractApi,
  HydraSwapXcmDepositedLocationLike,
} from '@inkathon/contracts/generated-types/hydra-swap'
import { DedotClient, WsProvider } from 'dedot'
import { Contract } from 'dedot/contracts'

import { PASEO_POP_RPC } from '@/config/get-supported-chains'

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
