/**
 * PageContextProvider - Universal Page-Aware Context for AskThom
 * 
 * This context stores the current page data that AskThom can use
 * to provide contextual, grounded advice.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react'

// The context can hold any JSON structure
interface PageContextData {
  pageName: string
  pageDescription?: string
  [key: string]: any
}

interface PageContextType {
  currentPageData: PageContextData | null
  setPageContext: (data: PageContextData) => void
  clearPageContext: () => void
}

export const PageContext = createContext<PageContextType | undefined>(undefined)

export function PageContextProvider({ children }: { children: ReactNode }) {
  const [currentPageData, setCurrentPageData] = useState<PageContextData | null>(null)

  // Ref to track if context has meaningfully changed (avoid spam)
  const lastContextKey = React.useRef<string | null>(null)
  
  const setPageContext = (data: PageContextData) => {
    // Create a key to identify meaningful changes
    const contextKey = `${data.pageName}|${data.currentlyViewingEmployee || ''}|${data.currentlyViewingCandidate || ''}|${data.currentlyViewingReferral || ''}`
    
    // Only log and update if context meaningfully changed
    if (contextKey !== lastContextKey.current) {
      console.log('PageContext: Context changed -', {
        pageName: data.pageName,
        viewing: data.currentlyViewingEmployee || data.currentlyViewingCandidate || data.currentlyViewingReferral || 'none'
      })
      lastContextKey.current = contextKey
    }
    
    setCurrentPageData(data)
  }

  const clearPageContext = () => {
    console.log('PageContext: Clearing context')
    setCurrentPageData(null)
  }

  return (
    <PageContext.Provider value={{ currentPageData, setPageContext, clearPageContext }}>
      {children}
    </PageContext.Provider>
  )
}

export function usePageContext() {
  const context = useContext(PageContext)
  if (context === undefined) {
    throw new Error('usePageContext must be used within a PageContextProvider')
  }
  return context
}

// Hook for easily setting page context with cleanup
export function useSetPageContext(data: PageContextData, deps: any[] = []) {
  const { setPageContext, clearPageContext } = usePageContext()
  
  React.useEffect(() => {
    setPageContext(data)
    return () => clearPageContext()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
