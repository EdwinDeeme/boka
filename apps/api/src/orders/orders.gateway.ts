import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'orders' })
export class OrdersGateway {
  @WebSocketServer()
  server: Server

  emitNewOrder(order: any) {
    this.server.emit('new_order', order)
  }

  emitOrderUpdated(order: any) {
    this.server.emit('order_updated', order)
  }

  @SubscribeMessage('join_dashboard')
  handleJoin() {
    return { event: 'joined', data: 'Dashboard conectado' }
  }
}
