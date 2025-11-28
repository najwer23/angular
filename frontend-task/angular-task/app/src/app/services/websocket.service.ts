import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { Observable, Subject, EMPTY } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class WebsocketService implements OnDestroy {
  private socket?: WebSocket;
  subject = new Subject<string>();

  constructor(private ngZone: NgZone) {}

  public connect(url: string): Observable<string> {
    this.socket = new WebSocket(url);

    this.socket.onopen = (event: Event) => {
      console.log("WebSocket connected:", url);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      this.ngZone.run(() => {
        this.subject.next(event.data);
      });
    };

    this.socket.onerror = (event: Event) => {
      console.error("WebSocket error - check server URL/port:", url, event);
    };

    this.socket.onclose = (event: CloseEvent) => {
      console.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
      this.socket = undefined;
      if (event.code === 1000) {
        this.subject.complete();
      }
    };

    return this.subject.asObservable();
  }

  public sendMessage(msg: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(msg);
    } else {
      console.warn("WebSocket not open (readyState:", this.socket?.readyState, "). Message not sent.");
    }
  }

  ngOnDestroy(): void {
    this.socket?.close(1000, "Service destroyed");
    this.subject.complete();
  }
}
