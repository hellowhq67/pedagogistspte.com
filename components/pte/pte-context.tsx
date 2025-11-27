'use client'

import { createContext, ReactNode, useContext, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export type PTEContextType = 'academic' | 'core'

type PTEState = {
  context: PTEContextType
  setContext: (context: PTEContextType) => void
}

const PTEContext = createContext<PTEState | undefined>(undefined)

export function PTEProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [context, setContextState] = useState<PTEContextType>('academic')

  // Sync context with URL
  useEffect(() => {
    if (pathname?.includes('/pte/core')) {
      setContextState('core')
    } else if (pathname?.includes('/pte/academic')) {
      setContextState('academic')
    }
  }, [pathname])

  const setContext = (newContext: PTEContextType) => {
    setContextState(newContext)
    
    // Navigate to the new context
    if (pathname) {
      const newPath = pathname.replace(/\/(academic|core)/, `/${newContext}`)
      if (newPath !== pathname) {
        router.push(newPath)
      }
    }
  }

  return (
    <PTEContext.Provider value={{ context, setContext }}>
      {children}
    </PTEContext.Provider>
  )
}

export function usePTE() {
  const context = useContext(PTEContext)
  if (!context) {
    throw new Error('usePTE must be used within a PTEProvider')
  }
  return context
}
