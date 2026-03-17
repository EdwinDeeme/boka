import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers'
import { ArrowRight, Clock, MapPin, Phone, Star, Truck } from 'lucide-react'
import { UpcomingCarousel } from '@/components/UpcomingCarousel'
import type { Product } from '@/types'

async function getOrderCount(): Promise<number> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/orders/count`,
      { next: { revalidate: 60 } }
    )
    const data: { count: number } = await res.json()
    return data.count
  } catch {
    return 0
  }
}

async function getUpcomingProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products?active=true`,
      { next: { revalidate: 60 } }
    )
    const data: Product[] = await res.json()
    return data
      .filter((p) => p.deliveryDate && new Date(p.deliveryDate) >= new Date())
      .sort((a, b) => new Date(a.deliveryDate!).getTime() - new Date(b.deliveryDate!).getTime())
  } catch {
    return []
  }
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const showOrderCount = cookieStore.get('show_order_count')?.value === 'true'

  const [upcoming, orderCount] = await Promise.all([
    getUpcomingProducts(),
    showOrderCount ? getOrderCount() : Promise.resolve(0),
  ])
  const displayCount = showOrderCount && orderCount > 0
    ? orderCount < 10 ? orderCount : Math.floor(orderCount / 10) * 10
    : null

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src="/boka-logo.png" alt="BOKA" className="h-8 w-auto" />
          <div className="flex items-center gap-6">
            <Link href="/menu" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
              Menú
            </Link>
            <Link href="/menu" className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
              Ordenar ahora <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/50 to-white" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Star size={11} fill="currentColor" />
              Abierto ahora · Lun–Dom 11am–10pm
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Comida que<br />
              <span className="text-brand-500">te encanta,</span><br />
              donde estés
            </h1>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-md">
              Ingredientes frescos, sabores que no olvidarás. Para recoger o envío a domicilio en Pérez Zeledón.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/menu" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-full transition-colors text-base shadow-lg shadow-orange-200">
                Ver menú completo <ArrowRight size={18} />
              </Link>
              {displayCount !== null && (
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex -space-x-2">
                    {['bg-orange-300', 'bg-amber-400', 'bg-orange-500'].map((c, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white`} />
                    ))}
                  </div>
                  <span>+{displayCount} pedidos</span>
                </div>
              )}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              <Image src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop&q=85" alt="Comida BOKA" fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-5 py-4 shadow-xl border border-gray-100">
              <p className="text-xs text-gray-400 font-medium">Tiempo estimado</p>
              <p className="text-2xl font-bold text-gray-900">20–30 min</p>
            </div>
            <div className="absolute -top-4 -right-4 bg-brand-500 text-white rounded-2xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-1.5">
                <Star size={14} fill="white" />
                <span className="font-bold text-lg">4.9</span>
              </div>
              <p className="text-xs text-brand-100">+500 reseñas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Próximas entregas */}
      {upcoming.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-10 text-center">
              <p className="text-brand-500 text-sm font-semibold uppercase tracking-wide mb-2">Próximas entregas</p>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">No te las pierdas</h2>
            </div>
            <div className={upcoming.length <= 3
              ? 'flex justify-center gap-5 flex-wrap'
              : ''
            }>
              <UpcomingCarousel initialProducts={upcoming} />
            </div>
          </div>
        </section>
      )}

      {/* Por qué elegirnos */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-wide mb-2">Por qué elegirnos</p>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Rápido, fresco y delicioso</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: 'Envío a domicilio', desc: 'Llevamos tu pedido hasta la puerta de tu casa en Pérez Zeledón.' },
              { icon: Clock, title: 'Listo en 20 minutos', desc: 'Preparamos al momento para que llegue caliente y listo para disfrutar.' },
              { icon: MapPin, title: 'También para recoger', desc: 'Pasa a recoger tu pedido y evita el tiempo de espera.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-card text-center">
                <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Icon size={22} className="text-brand-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galería */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-wide mb-2">Galería</p>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Hecho con amor</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop&q=80',
              'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=400&h=400&fit=crop&q=80',
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop&q=80',
              'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=400&fit=crop&q=80',
            ].map((src, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                <Image src={src} alt={`Foto ${i + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">¿Listo para ordenar?</h2>
          <p className="text-gray-400 mb-8">Elige tus favoritos y recíbelos en minutos.</p>
          <Link href="/menu" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg shadow-orange-900/30">
            Ver menú completo <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/boka-logo.png" alt="BOKA" className="h-7 w-auto" />
          <div className="flex items-center gap-2 text-sm">
            <Phone size={14} />
            <span>+506 8888-8888</span>
          </div>
          <p className="text-sm">© 2026 BOKA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
