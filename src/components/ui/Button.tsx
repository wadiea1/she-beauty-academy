import { cn } from '@/lib/cn'
import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-panel)] font-body font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50'

const variantClass: Record<Variant, string> = {
  primary: 'bg-ink text-porcelain hover:bg-cocoa focus-visible:outline-champagne',
  secondary:
    'border border-rosewood-ink/40 text-cocoa hover:border-rosewood-ink hover:bg-shell focus-visible:outline-rosewood-ink',
  ghost:
    'text-rosewood-ink underline-offset-4 hover:text-cocoa hover:underline focus-visible:outline-rosewood-ink',
  // For CTAs sitting on a dark (`tone="ink"`) Section, where `primary`
  // would nearly disappear against the matching ink background.
  inverse: 'bg-porcelain text-ink hover:bg-champagne focus-visible:outline-porcelain',
}

const sizeClass: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  className?: string
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { href?: undefined }

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & { href: string }

type ButtonProps = ButtonAsButton | ButtonAsLink

/**
 * Renders a `<button>` by default, or a Next `<Link>` when `href` is
 * provided — one primitive covers both actions and navigation CTAs.
 */
export function Button({ variant = 'primary', size = 'md', fullWidth = false, className, children, ...rest }: ButtonProps) {
  const classes = cn(base, variantClass[variant], sizeClass[size], fullWidth && 'w-full', className)

  if (rest.href !== undefined) {
    const { href, ...linkRest } = rest as ButtonAsLink
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    )
  }

  const { type = 'button', ...buttonRest } = rest as ButtonAsButton
  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  )
}
