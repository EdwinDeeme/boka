import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'orders' })
export class OrdersGateway {
  @WebSocketServer()
  server: Server

  emitNewOrder(order: unknown) {
    this.server.emit('new_order', order)
  }

  emitOrderUpdated(order: unknown) {
    this.server.emit('order_updated', order)
    // Notificar al cliente cuando su pedido está listo
    const o = order as { id: number; status: string; phone: string }
    if (o.status === 'LISTO') {
      this.server.emit('order_ready', { orderId: o.id, phone: o.phone })
    }
  }

  @SubscribeMessage('join_dashboard')
  handleJoin() {
    return { event: 'joined', data: 'Dashboard conectado' }
  }
}
