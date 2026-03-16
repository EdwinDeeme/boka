'use client'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import type { InventoryItem } from '@/types'

type Capacity = { productId: number; productName: string; capacity: number | null }

export type LowStockAlert = {
  // Ingredientes con stock bajo (< 5 unidades/kg/g según su unidad)
  lowIngredients: InventoryItem[]
  // Productos que se pueden hacer en 10 o menos unidades
  lowCapacityProducts: { productName: string; capacity: number }[]
}

const LOW_CAPACITY_THRESHOLD = 10

export function useLowStock() {
  const [alert, setAlert] = useState<LowStockAlert>({ lowIngredients: [], lowCapacityProducts: [] })

  const refresh = useCallback(async () => {
    const [inventory, capacities] = await Promise.all([
      api.get<InventoryItem[]>('/inventory'),
      api.get<Capacity[]>('/products/capacities/all').catch(() => [] as Capacity[]),
    ])

    const lowCapacityProducts = capacities
      .filter((c) => c.capacity !== null && c.capacity <= LOW_CAPACITY_THRESHOLD)
      .map((c) => ({ productName: c.productName, capacity: c.capacity as number }))
      .sort((a, b) => a.capacity - b.capacity)

    // Ingredientes que están siendo el cuello de botella (stock bajo en términos absolutos)
    // Usamos < 5 como umbral genérico — el usuario puede ajustar
    const lowIngredients = inventory.filter((i) => i.stock < 5)

    setAlert({ lowIngredients, lowCapacityProducts })
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 30_000) // refresca cada 30s
    return () => clearInterval(interval)
  }, [refresh])

  return { alert, refresh }
}
