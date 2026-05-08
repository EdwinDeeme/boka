'use client'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Branch } from '@/types'

export type ServiceType = 'ENVIO' | 'PICKUP' | 'MESA'

type BranchContextType = {
  branches: Branch[]
  selectedBranch: Branch | null
  serviceType: ServiceType | null
  tableNumber: string | null
  selectBranch: (branch: Branch) => void
  setService: (type: ServiceType, table?: string) => void
  clearBranch: () => void
  loading: boolean
}

const BranchContext = createContext<BranchContextType | null>(null)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [serviceType, setServiceType] = useState<ServiceType | null>(null)
  const [tableNumber, setTableNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(API_URL + '/branches/public')
      .then((r) => r.json())
      .then((data: Branch[]) => {
        setBranches(data)
        if (data.length === 1 && data[0].active) {
          setSelectedBranch(data[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function selectBranch(branch: Branch) { setSelectedBranch(branch) }

  function setService(type: ServiceType, table?: string) {
    setServiceType(type)
    setTableNumber(table ?? null)
  }

  function clearBranch() {
    setSelectedBranch(null)
    setServiceType(null)
    setTableNumber(null)
  }

  return (
    <BranchContext.Provider value={{ branches, selectedBranch, serviceType, tableNumber, selectBranch, setService, clearBranch, loading }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranch must be used within BranchProvider')
  return ctx
}
