import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from './Loading'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg' | 'xl'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-black hover:bg-brand-2 active:bg-brand-2',
  secondary: 'bg-surface-2 text-fg border border-line hover:border-muted',
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  danger: 'bg-danger/10 text-danger border border-danger/40 hover:bg-danger/20',
}

const SIZES: Record<Size, string> = {
  md: 'h-11 px-4 text-sm',
  lg: 'h-13 px-5 text-base',
  xl: 'h-16 px-6 text-lg',
}

function buttonClasses(variant: Variant = 'primary', size: Size = 'lg', block = false) {
  return [
    'inline-flex items-center justify-center gap-2 rounded-xl font-display font-bold uppercase tracking-wide',
    'transition-colors disabled:opacity-50 disabled:pointer-events-none select-none',
    VARIANTS[variant],
    SIZES[size],
    block ? 'w-full' : '',
  ].join(' ')
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'lg',
  block,
  loading,
  icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClasses(variant, size, block)} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner className="size-5" /> : icon}
      {children}
    </button>
  )
}

interface ButtonLinkProps {
  to: string
  variant?: Variant
  size?: Size
  block?: boolean
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function ButtonLink({ to, variant, size, block, icon, children, className = '' }: ButtonLinkProps) {
  return (
    <Link to={to} className={`${buttonClasses(variant, size, block)} ${className}`}>
      {icon}
      {children}
    </Link>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
}

export function IconButton({ label, children, className = '', type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
