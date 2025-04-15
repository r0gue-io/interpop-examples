import { useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { swapUsdtOnHydrationTx } from '@/transactions'
import { HydraSwapXcmDepositedLocationLike } from '@inkathon/contracts/generated-types/hydra-swap'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import { TxStatus } from 'dedot/types'
import { toast } from 'react-hot-toast'

import { PASEO_POP_RPC } from '@/config/get-supported-chains'

import { useAssetHubTokenAccount } from './useAssetHubTokenAccount'
import { fetchNativeToken } from './useBalance'

const USDT = 1984

export enum TxUiStatus {
  Submitting = 'Submitting',
  Idle = 'Idle',
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
        duration: 2000,
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

  return {
    handleSwap,
    assetHubUsdt,
    status,
  }
}
