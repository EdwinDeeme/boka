'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Option = { value: string; label: string }

interface SearchableSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  icon?: React.ReactNode
  required?: boolean
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  icon,
  required,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  // Calculate dropdown position from trigger rect
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const dropUp = spaceBelow < 280 && spaceAbove > spaceBelow

    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      ...(dropUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    })
  }, [])

  function handleOpen() {
    if (disabled) return
    updatePosition()
    setOpen((v) => !v)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return
      setOpen(false)
      setQuery('')
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  // Focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
  }, [open])

  function handleSelect(opt: Option) {
    onChange(opt.value)
    setOpen(false)
    setQuery('')
  }

  const dropdown = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropdownRef}
          style={dropdownStyle}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Options — max ~5 visible, scrollable */}
          <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin resultados</p>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors',
                      isSelected
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} className="text-brand-500 shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={cn(
          'w-full flex items-center gap-2.5 border rounded-xl px-4 py-3 text-sm text-left transition-all bg-white',
          open
            ? 'border-brand-400 ring-2 ring-brand-400/30'
            : 'border-gray-200 hover:border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
        <span className={cn('flex-1 truncate', !selected && 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 shrink-0"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      {/* Hidden native input for form validation */}
      {required && (
        <input
          tabIndex={-1}
          required={required}
          value={value}
          onChange={() => {}}
          className="absolute inset-0 opacity-0 pointer-events-none w-full"
          aria-hidden="true"
        />
      )}

      {/* Portal — escapes all overflow constraints */}
      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  )
}
