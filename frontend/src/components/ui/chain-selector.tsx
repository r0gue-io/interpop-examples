import React from 'react'

import { EndpointOption } from '@polkadot/apps-config/endpoints/types'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { RiArrowDownSLine } from 'react-icons/ri'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

import { Button } from './button'

type Props = {
  chainOptions: EndpointOption[]
  selectedChain: EndpointOption
  setSelectedChain: (chain: EndpointOption) => void
}

const ChainInfo = ({ chain }: { chain: EndpointOption }) => {
  return (
    <div className="flex items-center justify-between gap-2">
      {chain.ui.logo && (
        <img
          style={{
            width: 15,
            aspectRatio: '1/1',
            borderRadius: '50%',
          }}
          src={chain.ui.logo}
        />
      )}
      <p>{chain.text}</p>
    </div>
  )
}

const ChainSelector = ({ chainOptions, selectedChain, setSelectedChain }: Props) => {
  return (
    <div className="flex select-none flex-wrap items-stretch justify-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="w-full gap-2 rounded-md border border-white/10 bg-gray-900 px-4 py-3 font-bold text-foreground"
            translate="no"
          >
            <ChainInfo chain={selectedChain} />
            <RiArrowDownSLine size={20} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="no-scrollbar max-h-[200px] min-w-[14rem] overflow-scroll rounded-2xl">
          <React.Fragment>
            {/* Supported Chains */}
            {chainOptions.map((chain) => (
              <DropdownMenuItem
                className="cursor-pointer"
                key={chain.text}
                onClick={() => {
                  setSelectedChain(chain)
                }}
              >
                <ChainInfo chain={chain} />
              </DropdownMenuItem>
            ))}
          </React.Fragment>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ChainSelector
