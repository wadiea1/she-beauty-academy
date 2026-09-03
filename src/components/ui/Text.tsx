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

/**
 * Body leading is script-aware via `--body-leading` (globals.css):
 * Arabic paragraphs in IBM Plex Sans Arabic want noticeably more air
 * than Latin — 1.85 vs 1.65 — because the script's ascenders,
 * descenders and dots make tightly-led Arabic look cramped and read
 * slower. The per-size numbers below are relative adjustments to that
 * script baseline rather than absolute values, so one locale change
 * retunes every size coherently.
 */
const sizeClass: Record<Size, string> = {
  xs: 'text-xs leading-[calc(var(--body-leading)*0.91)]',
  sm: 'text-sm leading-[calc(var(--body-leading)*0.91)]',
  base: 'text-base leading-[var(--body-leading)] text-pretty',
  lg: 'text-lg leading-[calc(var(--body-leading)*0.97)] text-pretty',
  xl: 'text-xl leading-[calc(var(--body-leading)*0.91)] text-pretty',
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