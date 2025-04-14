/**
 * Returns the supported chains from the environment variables.
 * If the environment variable is not set, it returns the default chain.
 */
export const getSupportedChains = (): string[] => {
  const defaultChain = process.env.NEXT_PUBLIC_DEFAULT_CHAIN
  const parsedChains =
    !!process.env.NEXT_PUBLIC_SUPPORTED_CHAINS &&
    JSON.parse(process.env.NEXT_PUBLIC_SUPPORTED_CHAINS)
  return parsedChains || [defaultChain]
}

export const PASEO_ASSET_HUB_RPC = 'wss://sys.ibp.network/asset-hub-paseo'
export const PASEO_POP_RPC = 'wss://rpc3.paseo.popnetwork.xyz'
export const PASEO_HYDRATION_RPC = 'wss://paseo-rpc.play.hydration.cloud'
