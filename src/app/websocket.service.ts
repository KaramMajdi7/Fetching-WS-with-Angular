import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3001');
  }

  joinRoom(room: string ) {
    console.log(`Room from service: ${room}`);
    this.socket.emit('joinRoom', room );
  }

  leaveRoom(room: string ) {
    this.socket.emit('leaveRoom', room );
  }

  createMessage(message: {name: string, message: string, room: string}): void {
      this.socket.emit('chatToServer', message);
  }

  findAllMessages(): Observable<any> {
      return new Observable((observer) => {
          this.socket.on('chatToClient', (data: any) => {
              observer.next(data);
          });
      });
  }

}
