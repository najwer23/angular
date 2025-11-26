import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  subject = new Subject<string>();

  constructor(private ngZone: NgZone) {}

  public connect(url: string): Observable<string> {
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      this.ngZone.run(() => {
        this.subject.next(event.data);
      });
    };

    return this.subject.asObservable();
  }

  public sendMessage(msg: string) {
    if(this.socket && this.socket.readyState === WebSocket.OPEN){
      this.socket.send(msg);
    }
  }


}
