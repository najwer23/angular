import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class WebsocketService implements OnDestroy {
  private socket?: WebSocket;
  public subject = new Subject<string>();

  constructor(private ngZone: NgZone) {}

  public connect(url: string): Observable<string> {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(url);

    this.socket.onmessage = (event: MessageEvent) => {
      this.ngZone.run(() => {
        this.subject.next(event.data);
      });
    };

    this.socket.onerror = (event: Event) => {
      console.error("WebSocket error:", event);
    };

    this.socket.onclose = (event: CloseEvent) => {
      console.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
    };

    return this.subject.asObservable();
  }

  public sendMessage(msg: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(msg);
    } else {
      console.warn("WebSocket not open. Message not sent.");
    }
  }

  ngOnDestroy() {
    this.socket?.close();
    this.subject.complete();
  }
}
