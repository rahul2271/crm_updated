'use client'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none'
    const variants = {
      primary:   'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500',
      secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 focus:ring-gray-300',
      ghost:     'bg-transparent hover:bg-gray-100 text-gray-600 focus:ring-gray-300',
      danger:    'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    }
    const sizes = { sm: 'text-sm px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-base px-6 py-2.5' }
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
        {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={inputId} className="text-sm font-medium text-gray-700">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>}
        <input ref={ref} id={inputId}
          className={cn('w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow',
            error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300', className)}
          {...props} />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={inputId} className="text-sm font-medium text-gray-700">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>}
        <select ref={ref} id={inputId}
          className={cn('w-full rounded-lg border px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500',
            error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300', className)}
          {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'gray', className }: { children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'teal'; className?: string }) {
  const colors = { green: 'bg-green-100 text-green-700', red: 'bg-red-100 text-red-700', yellow: 'bg-yellow-100 text-yellow-700', blue: 'bg-blue-100 text-blue-700', gray: 'bg-gray-100 text-gray-600', teal: 'bg-brand-100 text-brand-800' }
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', colors[color], className)}>{children}</span>
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className, title, subtitle }: { children: React.ReactNode; className?: string; title?: string; subtitle?: string }) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 shadow-sm', className)}>
      {(title || subtitle) && (
        <div className="px-5 pt-5 pb-4 border-b border-gray-50">
          {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, color = 'teal' }: { label: string; value: string | number; sub?: string; icon?: React.ReactNode; color?: 'teal' | 'blue' | 'green' | 'purple' | 'orange' }) {
  const colors = { teal: 'bg-brand-50 text-brand-600', blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', orange: 'bg-orange-50 text-orange-600' }
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        {icon && <div className={cn('p-2.5 rounded-lg', colors[color])}>{icon}</div>}
      </div>
    </div>
  )
}
