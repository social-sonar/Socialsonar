import Link from 'next/link'
import clsx from 'clsx'

const variantStyles = {
  primary:
    'bg-zinc-800 font-semibold text-zinc-100 enabled:hover:bg-zinc-700 enabled:active:bg-zinc-800 enabled:active:text-zinc-100/70 dark:bg-zinc-700 dark:enabled:hover:bg-zinc-600 dark:enabled:active:bg-zinc-700 dark:enabled:active:text-zinc-100/70',
  secondary:
    'bg-zinc-50 font-medium text-zinc-900 enabled:hover:bg-zinc-100 enabled:active:bg-zinc-100 enabled:active:text-zinc-900/60 dark:bg-zinc-800/50 dark:text-zinc-300 dark:enabled:hover:bg-zinc-800 dark:enabled:hover:text-zinc-50 dark:enabled:active:bg-zinc-800/50 dark:enabled:active:text-zinc-50/70',
}

type ButtonProps = {
  variant?: keyof typeof variantStyles
} & (
    | (React.ComponentPropsWithoutRef<'button'> & { href?: undefined })
    | React.ComponentPropsWithoutRef<typeof Link>
  )

export default function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  className = clsx(
    'inline-flex items-center gap-2 justify-center rounded-md py-2 px-3 text-sm outline-offset-2 transition enabled:active:transition-none',
    variantStyles[variant],
    className,
  )

  return typeof props.href === 'undefined' ? (
    <button className={className} {...props} />
  ) : (
    <Link className={className} {...props} />
  )
}
