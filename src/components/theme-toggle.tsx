import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'mobench-theme'

function systemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

function storedTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage?.getItem?.(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'light'
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const syncTheme = () => {
      const next = storedTheme() ?? (media.matches ? 'dark' : 'light')
      applyTheme(next)
      setTheme(next)
    }

    syncTheme()
    media.addEventListener('change', syncTheme)
    window.addEventListener('storage', syncTheme)

    return () => {
      media.removeEventListener('change', syncTheme)
      window.removeEventListener('storage', syncTheme)
    }
  }, [])

  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const Icon = theme === 'dark' ? Sun : Moon

  return (
    <button
      type="button"
      data-theme-toggle
      onClick={() => {
        try {
          window.localStorage?.setItem?.(STORAGE_KEY, nextTheme)
        } catch {
          // Storage can be unavailable in hardened browser contexts; the in-page theme still updates.
        }
        applyTheme(nextTheme)
        setTheme(nextTheme)
      }}
      className={cn(
        'inline-flex h-9 min-w-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[rgba(20,18,12,0.16)] bg-white px-2.5 font-sans text-[13px] font-medium text-ink transition-colors hover:border-green/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/35 sm:px-3',
        className,
      )}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <Icon size={15} />
      <span className="hidden sm:inline">{nextTheme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  )
}
