import React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import { RiArrowDownSLine } from 'react-icons/ri'

import { EXAMPLES, useAccount } from '@/hooks/useAccount'

import { Button } from './button'

export const PageSelector = () => {
  const { selectedExample, setSelectedExample } = useAccount()
  return (
    <React.Fragment>
      <div className="flex select-none flex-wrap items-stretch justify-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="w-full gap-2 rounded-md border border-white/10 bg-gray-900 px-4 py-3 font-bold text-foreground"
              translate="no"
            >
              {EXAMPLES.find((e) => e.key === (selectedExample as any))?.name}
              <RiArrowDownSLine size={20} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="no-scrollbar max-h-[200px] min-w-[14rem] overflow-scroll rounded-2xl bg-gray-900 px-3 py-3">
            <React.Fragment>
              {/* Supported Chains */}
              {EXAMPLES.map((example) => (
                <DropdownMenuItem
                  className="cursor-pointer px-2 py-2 hover:bg-gray-700"
                  key={example.key}
                  onClick={() => {
                    if (setSelectedExample) setSelectedExample(example.key)
                  }}
                >
                  {example.name}
                </DropdownMenuItem>
              ))}
            </React.Fragment>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <br />
      {EXAMPLES.find((e) => e.key === (selectedExample as any))?.page}
    </React.Fragment>
  )
}
