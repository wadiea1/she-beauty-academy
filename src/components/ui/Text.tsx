import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type As = 'p' | 'span' | 'div' | 'li'
type Size = 'xs' | 'sm' | 'base' | 'lg' | 'xl'
type Tone = 'default' | 'muted'

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: As
  size?: Size
  tone?: Tone
}

const sizeClass: Record<Size, string> = {
  xs: 'text-xs leading-[1.5]',
  sm: 'text-sm leading-[1.5]',
  base: 'text-base leading-[1.6] text-pretty',
  lg: 'text-lg leading-[1.55] text-pretty',
  xl: 'text-xl leading-[1.45] text-pretty',
}

const toneClass: Record<Tone, string> = {
  default: '',
  muted: 'text-rosewood-ink',
}

export function Text({
  as: Tag = 'p',
  size = 'base',
  tone = 'default',
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <Tag
      className={cn(
        'font-body',
        sizeClass[size],
        toneClass[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}