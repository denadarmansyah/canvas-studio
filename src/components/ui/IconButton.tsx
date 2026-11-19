import React from 'react'
import type { LucideIcon } from 'lucide-react'

export type IconButtonSize = 'sm' | 'md' | 'lg' | 'xl'
export type IconButtonVariant = 'default' | 'primary' | 'lime' | 'danger' | 'ghost'

const ICON_PX: Record<IconButtonSize, number> = {
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
}

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  icon?: LucideIcon
  label: string
  tooltip?: string
  size?: IconButtonSize
  variant?: IconButtonVariant
  selected?: boolean
  active?: boolean
  strokeWidth?: number
}

export function IconButton({
  icon: Icon,
  label,
  tooltip,
  size = 'md',
  variant = 'default',
  selected = false,
  active = false,
  strokeWidth = 1.85,
  className = '',
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const tip = tooltip ?? label
  const classes = [
    'cs-icon-btn',
    `cs-icon-btn--${size}`,
    variant !== 'default' ? `cs-icon-btn--${variant}` : '',
    selected ? 'is-selected' : '',
    active ? 'is-active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      aria-label={label}
      aria-pressed={selected || active ? true : undefined}
      title={tip}
      data-tooltip={tip}
      {...rest}
    >
      {Icon ? <Icon size={ICON_PX[size]} strokeWidth={strokeWidth} aria-hidden="true" /> : children}
    </button>
  )
}
