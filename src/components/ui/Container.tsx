import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type Width = 'editorial' | 'reading'
type As = 'div' | 'section' | 'article' | 'main'

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  width?: Width
  as?: As
}

const widthClass: Record<Width, string> = {
  editorial: 'max-w-[var(--container-editorial)]',
  reading: 'max-w-[var(--container-reading)]',
}

export function Container({
  width = 'editorial',
  as: Tag = 'div',
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full',
        'px-6 sm:px-8 lg:px-12', // symmetric padding: safe in both LTR and RTL
        widthClass[width],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}