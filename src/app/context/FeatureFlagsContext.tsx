import React from 'react'
import type { FeatureFlags } from '@services/featureFlags'

const STORAGE_KEY = 'pad_feature_flags'

type FeatureFlagsContextValue = {
  flags: FeatureFlags
  setFlags: (f: FeatureFlags) => void
}

const FeatureFlagsContext = React.createContext<FeatureFlagsContextValue | undefined>(undefined)

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlagsState] = React.useState<FeatureFlags>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as FeatureFlags) : {}
    } catch {
      return {}
    }
  })
  const setFlags = React.useCallback((f: FeatureFlags) => {
    setFlagsState(f)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(f))
    } catch {}
  }, [])

  const value = React.useMemo(() => ({ flags, setFlags }), [flags, setFlags])
  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>
}

export function useFeatureFlags(): FeatureFlagsContextValue {
  const ctx = React.useContext(FeatureFlagsContext)
  if (!ctx) throw new Error('useFeatureFlags must be used within FeatureFlagsProvider')
  return ctx
}


