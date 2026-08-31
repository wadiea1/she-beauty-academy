import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type As = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type Size = 'display' | 'xl' | 'lg' | 'md' | 'sm'

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: As
  size?: Size
}

const sizeClass: Record<Size, string> = {
  display: 'text-6xl leading-[1.1]',
  xl: 'text-5xl leading-[1.12]',
  lg: 'text-4xl leading-[1.15]',
  md: 'text-3xl leading-[1.2]',
  sm: 'text-2xl leading-[1.25]',
}

export function Heading({
  as: Tag = 'h2',
  size = 'md',
  className,
  children,
  ...rest
}: HeadingProps) {
  return (
    <Tag
      className={cn(
        'font-display font-normal text-balance',
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}