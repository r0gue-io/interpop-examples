// Generated by dedot cli

import type { GenericSubstrateApi, RpcLegacy, RpcV2, RpcVersion } from 'dedot/types'
import { ChainConsts } from './consts.js'
import { ChainStorage } from './query.js'
import { ChainJsonRpcApis } from './json-rpc.js'
import { ChainErrors } from './errors.js'
import { ChainEvents } from './events.js'
import { RuntimeApis } from './runtime.js'
import { ChainTx } from './tx.js'

export * from './types.js'

export interface VersionedAssetHubPaseoApi<Rv extends RpcVersion> extends GenericSubstrateApi<Rv> {
  rpc: ChainJsonRpcApis<Rv>
  consts: ChainConsts<Rv>
  query: ChainStorage<Rv>
  errors: ChainErrors<Rv>
  events: ChainEvents<Rv>
  call: RuntimeApis<Rv>
  tx: ChainTx<Rv>
}

/**
 * @name: AssetHubPaseoApi
 * @specVersion: 1003003
 **/
export interface AssetHubPaseoApi {
  legacy: VersionedAssetHubPaseoApi<RpcLegacy>
  v2: VersionedAssetHubPaseoApi<RpcV2>
}
