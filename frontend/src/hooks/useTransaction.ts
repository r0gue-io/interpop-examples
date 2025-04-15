import { useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { fundParachainDirect, fundParachainIndirect, swapUsdtOnHydrationTx } from '@/transactions'
import { HydraSwapXcmDepositedLocationLike } from '@inkathon/contracts/generated-types/hydra-swap'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import { TxStatus } from 'dedot/types'
import { toast } from 'react-hot-toast'

import { PASEO_ASSET_HUB_RPC, PASEO_POP_RPC } from '@/config/get-supported-chains'

import { useAssetHubTokenAccount } from './useAssetHubTokenAccount'
import { fetchNativeToken, useBalance } from './useBalance'

const USDT = 1984
const HYDRATION_SA = '5Eg2fntQqFi3EvFWAf71G66Ecjjah26bmFzoANAeHFgj9Lia'
const POP_SA = '5Eg2fnt8cGL5CBhRRhi59abAwb3SPoAdPJpN9qY7bQqpzpf6'

export enum TxUiStatus {
  Submitting = 'Submitting',
  Idle = 'Idle',
}

export const useHydrationSAOnAssetHub = () => {
  const sovereignUsdt = useAssetHubTokenAccount(USDT, HYDRATION_SA)
  const sovereignPASOnAssetHub = useBalance(PASEO_ASSET_HUB_RPC, HYDRATION_SA, true, {
    forceUnit: false,
    fixedDecimals: 4,
    removeTrailingZeros: true,
  })
  return { sovereignPASOnAssetHub, sovereignUsdt }
}

export const usePopSAOnAssetHub = () => {
  const sovereignPASOnAssetHub = useBalance(PASEO_ASSET_HUB_RPC, POP_SA, true, {
    forceUnit: false,
    fixedDecimals: 4,
    removeTrailingZeros: true,
  })
  return { sovereignPASOnAssetHub }
}

export const useTransaction = () => {
  const [status, setStatus] = useState<TxUiStatus>(TxUiStatus.Idle)
  const { activeAccount, activeSigner, api } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.Swap)
  const assetHubUsdt = useAssetHubTokenAccount(USDT, activeAccount?.address)

  const handleTransactionStatus = (status: TxStatus) => {
    console.log('Transaction status', status.type)
    if (status.type === 'Broadcasting') {
      toast.loading(`Broadcasting transaction...`, {
        duration: 4000,
      })
      return true
    }
    if (status.type === 'BestChainBlockIncluded' || status.type === 'Finalized') {
      toast.success(`Transaction completed at block hash ${status.value.blockHash}`)
      setStatus(TxUiStatus.Idle)
      return false
    }
    if (status.type === 'Invalid') {
      toast.error(`Transaction failed at block hash ${status.value.error}`)
      setStatus(TxUiStatus.Idle)
      return true
    }
  }

  const handleSwap = async (
    amountOut: number | undefined,
    sentPaseo: number | undefined,
    dest: HydraSwapXcmDepositedLocationLike | undefined,
  ) => {
    setStatus(TxUiStatus.Submitting)
    if (!amountOut || !sentPaseo || !dest) {
      toast.error('Missing required fields')
      return
    }
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }
    const nativeToken = await fetchNativeToken(PASEO_POP_RPC)
    const tx = await swapUsdtOnHydrationTx(
      activeSigner,
      amountOut * 10 ** (assetHubUsdt.metadata?.decimals || 0),
      1_000_000_0000_000_000,
      3_000_000_000,
      dest,
      90_000_000_000,
      900_000,
      sentPaseo * 10 ** nativeToken.decimals,
    )
    await tx.signAndSend(activeAccount.address, async ({ status }) => {
      handleTransactionStatus(status)
    })
  }

  const handleDirectReserveTransferParachain = async (
    fromPara: number | undefined,
    toPara: number | undefined,
    beneficiary: string | undefined,
    hashed: boolean,
    sentPaseo: number | undefined,
  ) => {
    if (!fromPara || !sentPaseo || !toPara || !beneficiary) {
      toast.error('Missing required fields')
      return
    }
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }
    setStatus(TxUiStatus.Submitting)
    const nativeToken = await fetchNativeToken(PASEO_POP_RPC)
    const tx = await fundParachainDirect(
      activeSigner,
      fromPara,
      toPara,
      beneficiary,
      hashed,
      90_000_000_000,
      900_000,
      sentPaseo * 10 ** nativeToken.decimals,
    )
    await tx.signAndSend(activeAccount.address, async ({ status }) => {
      handleTransactionStatus(status)
    })
  }

  const handleIndirectReserveTransferParachain = async (
    fromPara: number | undefined,
    intemediaryHop: number | undefined,
    toPara: number | undefined,
    beneficiary: string | undefined,
    hashed: boolean,
    sentPaseo: number | undefined,
  ) => {
    if (!fromPara || !sentPaseo || !intemediaryHop || !toPara || !beneficiary) {
      toast.error('Missing required fields')
      return
    }
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }
    setStatus(TxUiStatus.Submitting)
    const nativeToken = await fetchNativeToken(PASEO_POP_RPC)
    const tx = await fundParachainIndirect(
      activeSigner,
      fromPara,
      intemediaryHop,
      toPara,
      beneficiary,
      hashed,
      90_000_000_000,
      900_000,
      sentPaseo * 10 ** nativeToken.decimals,
    )
    await tx.signAndSend(activeAccount.address, async ({ status }) => {
      handleTransactionStatus(status)
    })
  }

  return {
    handleSwap,
    handleDirectReserveTransferParachain,
    handleIndirectReserveTransferParachain,
    assetHubUsdt,
    status,
  }
}
