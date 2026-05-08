'use client'
import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/context/CartContext'
import { BranchProvider } from '@/context/BranchContext'
import { BranchSelector } from '@/components/BranchSelector'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BranchProvider>
        <CartProvider>
          <BranchSelector />
          {children}
        </CartProvider>
      </BranchProvider>
    </SessionProvider>
  )
}
