import { useEffect, useState } from 'react'

import { ApiPromise, WsProvider } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import {
  BalanceData,
  BalanceFormatterOptions,
  getBalance,
  watchBalance,
} from '@scio-labs/use-inkathon'

export const useBalance = (
  wss: string,
  address?: string | AccountId,
  watch?: boolean,
  formatterOptions?: BalanceFormatterOptions,
): BalanceData => {
  const [balanceData, setBalanceData] = useState<BalanceData>({
    tokenSymbol: 'Unit',
    tokenDecimals: 12,
  } satisfies BalanceData)
  const [unsubscribes, setUnsubscribes] = useState<(VoidFunction | null)[]>([])

  useEffect(() => {
    const init = async () => {
      const provider = new WsProvider(wss)
      const api = await ApiPromise.create({ provider })
      const updateBalanceData = (data: BalanceData) => {
        setBalanceData(() => data)
      }

      if (!api) {
        updateBalanceData({} as BalanceData)
        return
      }

      if (watch) {
        watchBalance(api, address, updateBalanceData, formatterOptions).then((unsubscribe) => {
          setUnsubscribes((prev) => [...prev, unsubscribe])
        })
      } else {
        getBalance(api, address, formatterOptions).then(updateBalanceData)
      }
    }
    init()
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe?.())
      setUnsubscribes(() => [])
    }
  }, [wss, address])

  return balanceData
}
