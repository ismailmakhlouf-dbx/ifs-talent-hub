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

  const setPageContext = (data: PageContextData) => {
    console.log('PageContext: Setting context -', {
      pageName: data.pageName,
      currentlyViewingEmployee: data.currentlyViewingEmployee,
      currentlyViewingCandidate: data.currentlyViewingCandidate,
      hasEmployeeData: !!data.employee,
      hasPerformanceData: !!data.performance
    })
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
