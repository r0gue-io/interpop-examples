import { FundParachainTx } from '@/components/web3/fund-parachain-tx'
import { SwapAndSendTxInteractions } from '@/components/web3/swap-and-send-tx'
import { SwapUsdtAndDepositTxInteractions } from '@/components/web3/swap-usdt-and-deposit-tx'
import { SwapUsdtAndSendTxInteractions } from '@/components/web3/swap-usdt-and-send-tx'

export const EXAMPLES = [
  {
    key: 'swap-contract::swap-and-send-to-parachain',
    name: 'Swap token and send to parachain',
    page: <SwapAndSendTxInteractions />,
  },
  {
    key: 'swap-contract::swap-usdt-and-send-to-parachain',
    name: 'Swap USDT and send to parachain',
    page: <SwapUsdtAndSendTxInteractions />,
  },
  {
    key: 'swap-contract::swap-usdt-and-deposit-to-local-account',
    name: 'Swap USDT and deposit to local account',
    page: <SwapUsdtAndDepositTxInteractions />,
  },
  {
    key: 'swap-contract::fund-parachain',
    name: 'Fund a parachain directly',
    page: <FundParachainTx />,
  },
]
