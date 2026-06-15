'use client'

import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface TooltipIconProps {
  tooltip: string
}

export function TooltipIcon({ tooltip }: TooltipIconProps) {
  const lines = tooltip.split('\n')
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className="ml-1 inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-[10px] font-bold leading-none text-gray-400 ring-1 ring-gray-300 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
        aria-label="Više informacija"
      >
        i
      </TooltipTrigger>
      <TooltipContent className="max-w-70 text-[13px] leading-relaxed whitespace-normal">
        {lines.map((line, i) => (
          <p key={i} className={line === '' ? 'h-2' : ''}>{line}</p>
        ))}
      </TooltipContent>
    </Tooltip>
  )
}

interface HelperTextProps {
  text: string
}

export function HelperText({ text }: HelperTextProps) {
  return (
    <p className="mt-1 text-[12px] italic text-gray-500">{text}</p>
  )
}
