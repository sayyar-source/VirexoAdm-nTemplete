import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/Icon'

/* Figma: 02 Components / Inputs — Default · Focus · Filled · Disabled · Error.
   The sheet has no label, hint or error-message slot; every input there is a
   bare box. Those three are added here because a form without them is not
   shippable. See ANALYSIS.md §4.1. */

const CONTROL_BASE =
  'w-full bg-surface text-fg text-body-sm rounded-md border border-border ' +
  'transition-[border-color,box-shadow] duration-150 ' +
  'placeholder:text-fg-subtle ' +
  'focus:border-primary focus:outline-none focus:ring-3 focus:ring-ring ' +
  'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-subtle'

const INVALID = 'border-danger focus:border-danger focus:ring-danger/25'

interface FieldShellProps {
  id: string
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  optionalText?: string
  children: ReactNode
  className?: string
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  optionalText,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-caption font-medium text-fg-muted">
          {label}
          {required && (
            <span className="ms-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
          {!required && optionalText && (
            <span className="ms-1 font-normal text-fg-subtle">({optionalText})</span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1 text-caption text-danger">
          <Icon name="alertCircle" size={13} />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-caption text-fg-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  iconStart?: IconName
  iconEnd?: ReactNode
  optionalText?: string
  wrapperClassName?: string
}

export function Input({
  label,
  hint,
  error,
  iconStart,
  iconEnd,
  required,
  optionalText,
  className,
  wrapperClassName,
  id,
  ...rest
}: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <FieldShell
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optionalText={optionalText}
      className={wrapperClassName}
    >
      <div className="relative">
        {iconStart && (
          // `start-3` = inset-inline-start: mirrors automatically in RTL.
          <Icon
            name={iconStart}
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            CONTROL_BASE,
            'h-10 px-3',
            iconStart && 'ps-9',
            iconEnd && 'pe-9',
            error && INVALID,
            className,
          )}
          {...rest}
        />
        {iconEnd && (
          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-fg-subtle">
            {iconEnd}
          </span>
        )}
      </div>
    </FieldShell>
  )
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  wrapperClassName?: string
}

export function Select({
  label,
  hint,
  error,
  required,
  className,
  wrapperClassName,
  id,
  children,
  ...rest
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  return (
    <FieldShell
      id={selectId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(
            CONTROL_BASE,
            'h-10 appearance-none ps-3 pe-9',
            error && INVALID,
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        <Icon
          name="chevronDown"
          size={16}
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-fg-subtle"
        />
      </div>
    </FieldShell>
  )
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  description?: ReactNode
}

export function Checkbox({ label, description, className, id, ...rest }: CheckboxProps) {
  const autoId = useId()
  const boxId = id ?? autoId
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={boxId}
        type="checkbox"
        className={cn(
          'mt-0.5 size-4 shrink-0 appearance-none rounded-xs border border-border-strong bg-surface',
          'transition-colors duration-150',
          'checked:border-primary checked:bg-primary',
          'indeterminate:border-primary indeterminate:bg-primary',
          "checked:bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'><path d='M5 13l4.5 4.5L19 7'/></svg>\")] checked:bg-center checked:bg-no-repeat",
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...rest}
      />
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <label htmlFor={boxId} className="block text-body-sm text-fg">
              {label}
            </label>
          )}
          {description && <p className="text-caption text-fg-subtle">{description}</p>}
        </div>
      )}
    </div>
  )
}

export function Radio({ label, className, id, ...rest }: CheckboxProps) {
  const autoId = useId()
  const radioId = id ?? autoId
  return (
    <div className="flex items-center gap-2.5">
      <input
        id={radioId}
        type="radio"
        className={cn(
          'size-4 shrink-0 appearance-none rounded-full border border-border-strong bg-surface',
          'transition-colors duration-150',
          'checked:border-[5px] checked:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...rest}
      />
      {label && (
        <label htmlFor={radioId} className="text-body-sm text-fg">
          {label}
        </label>
      )}
    </div>
  )
}

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
}

export function Switch({ label, className, id, ...rest }: SwitchProps) {
  const autoId = useId()
  const switchId = id ?? autoId
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative inline-flex">
        <input
          id={switchId}
          type="checkbox"
          role="switch"
          className={cn(
            'peer h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full bg-border-strong',
            'transition-colors duration-200 checked:bg-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...rest}
        />
        {/* The knob animates on `inset-inline-start`, not translate-x, so it
            travels toward the correct edge in RTL with no `rtl:` override. */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-0.5 size-4 rounded-full bg-white shadow-sm',
            'transition-[inset-inline-start] duration-200 motion-safe-anim',
            'start-0.5 peer-checked:start-[calc(100%-1.125rem)]',
          )}
        />
      </div>
      {label && (
        <label htmlFor={switchId} className="text-body-sm text-fg">
          {label}
        </label>
      )}
    </div>
  )
}
