import { address } from '@inkathon/contracts/deployments/swap/pop-network-testnet'
import swapMetadata from '@inkathon/contracts/deployments/swap/swap.json'
import { HydradxApi } from '@inkathon/contracts/generated-types/chains/hydradx'
import {
  HydraSwapContractApi,
  HydraSwapXcmDepositedLocationLike,
} from '@inkathon/contracts/generated-types/hydra-swap'
import { DedotClient, WsProvider } from 'dedot'
import { Contract } from 'dedot/contracts'
import { AccountNonceApi, TaggedTransactionQueue, TransactionPaymentApi } from 'dedot/runtime-specs'
import { RuntimeApiSpec, VersionedGenericSubstrateApi } from 'dedot/types'

import { PASEO_HYDRATION_RPC, PASEO_POP_RPC } from '@/config/get-supported-chains'

export async function createApi<T extends VersionedGenericSubstrateApi>(wss: string) {
  const provider = new WsProvider(wss)
  const api = await DedotClient.new<T>({
    provider,
    cacheMetadata: true,
    runtimeApis: { ContractsApi, TaggedTransactionQueue, TransactionPaymentApi, AccountNonceApi },
  })
  return api
}

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

export const fundParachainDirect = async (
  signer: any,
  fromPara: number,
  toPara: number,
  beneficiary: string,
  hashed: boolean,
  refTime: number,
  proofSize: number,
  sentPaseo: number,
) => {
  const api = await createApi<any>(PASEO_POP_RPC)
  api.setSigner(signer)
  const contract = new Contract<HydraSwapContractApi>(api, swapMetadata as any, address)
  return contract.tx.fundDirect(beneficiary, fromPara, toPara, hashed, {
    gasLimit: {
      refTime: BigInt(refTime),
      proofSize: BigInt(proofSize),
    },
    value: BigInt(sentPaseo),
  })
}

export const fundParachainIndirect = async (
  signer: any,
  fromPara: number,
  intemediaryHop: number,
  toPara: number,
  beneficiary: string,
  hashed: boolean,
  refTime: number,
  proofSize: number,
  sentPaseo: number,
) => {
  const api = await createApi<any>(PASEO_POP_RPC)
  api.setSigner(signer)
  const contract = new Contract<HydraSwapContractApi>(api, swapMetadata as any, address)
  return contract.tx.fundIndirect(beneficiary, fromPara, intemediaryHop, toPara, hashed, {
    gasLimit: {
      refTime: BigInt(refTime),
      proofSize: BigInt(proofSize),
    },
    value: BigInt(sentPaseo),
  })
}

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
  const api = await createApi<any>(PASEO_POP_RPC)
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

export const swapAnyOnHydrationTx = async (
  signer: any,
  fromPara: number,
  intermediaryHop: number,
  giveAssetId: number,
  wantAssetId: number,
  amountOut: number,
  maxAmountIn: number,
  feeAmount: number,
  dest: HydraSwapXcmDepositedLocationLike,
  refTime: number,
  proofSize: number,
  sentPaseo: number,
) => {
  const hydrationApi = await createApi<HydradxApi>(PASEO_HYDRATION_RPC)
  const giveAsset = await hydrationApi.query.assetRegistry.assetLocations(giveAssetId)
  const wantAsset = await hydrationApi.query.assetRegistry.assetLocations(wantAssetId)
  if (!giveAsset || !wantAsset) throw new Error('No asset found')

  const api = await createApi<any>(PASEO_POP_RPC)
  api.setSigner(signer)
  const contract = new Contract<HydraSwapContractApi>(api, swapMetadata as any, address)
  return contract.tx.transferAndSwapOnHydra(
    fromPara,
    intermediaryHop,
    {
      fun: {
        type: 'Fungible',
        value: BigInt(maxAmountIn),
      },
      id: giveAsset as any,
    },
    {
      fun: {
        type: 'Fungible',
        value: BigInt(amountOut),
      },
      id: wantAsset as any,
    },
    false,
    {
      fun: {
        type: 'Fungible',
        value: BigInt(feeAmount),
      },
      id: giveAsset as any,
    },
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
