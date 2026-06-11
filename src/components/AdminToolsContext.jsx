import React, { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'leland-admin-variants'

const defaults = {
  trackCards: 'v1',
}

const AdminToolsContext = createContext()

export function AdminToolsProvider({ children }) {
  const [variants, setVariants] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return { ...defaults, ...JSON.parse(stored) }
      }
    } catch {}
    return { ...defaults }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(variants))
    } catch {}
  }, [variants])

  function setVariant(key, value) {
    setVariants(prev => ({ ...prev, [key]: value }))
  }

  return (
    <AdminToolsContext.Provider value={{ variants, setVariant }}>
      {children}
    </AdminToolsContext.Provider>
  )
}

export function useAdminTools() {
  const ctx = useContext(AdminToolsContext)
  if (!ctx) {
    throw new Error('useAdminTools must be used within an AdminToolsProvider')
  }
  return ctx
}
