'use client'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Branch } from '@/types'
import { api } from '@/lib/api'

type AdminBranchContextType = {
  branches: Branch[]
  activeBranch: Branch | null
  setActiveBranch: (branch: Branch) => void
  loading: boolean
}

const AdminBranchContext = createContext<AdminBranchContextType | null>(null)
const ADMIN_BRANCH_KEY = 'boka_admin_branch'

export function AdminBranchProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [activeBranch, setActiveBranchState] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Branch[]>('/branches')
      .then((data) => {
        setBranches(data)
        try {
          const saved = localStorage.getItem(ADMIN_BRANCH_KEY)
          if (saved) {
            const parsed: Branch = JSON.parse(saved)
            const found = data.find((b) => b.id === parsed.id)
            if (found) { setActiveBranchState(found); return }
          }
          // Default to first branch
          if (data.length > 0) setActiveBranchState(data[0])
        } catch {
          if (data.length > 0) setActiveBranchState(data[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function setActiveBranch(branch: Branch) {
    setActiveBranchState(branch)
    try { localStorage.setItem(ADMIN_BRANCH_KEY, JSON.stringify(branch)) } catch {}
  }

  return (
    <AdminBranchContext.Provider value={{ branches, activeBranch, setActiveBranch, loading }}>
      {children}
    </AdminBranchContext.Provider>
  )
}

export function useAdminBranch() {
  const ctx = useContext(AdminBranchContext)
  if (!ctx) throw new Error('useAdminBranch must be used within AdminBranchProvider')
  return ctx
}
