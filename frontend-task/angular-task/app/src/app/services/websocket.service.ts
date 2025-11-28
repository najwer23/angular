import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { Observable, Subject, merge, map } from "rxjs";
import { ApiUserResponse } from "./user.service";

export interface WebSocketReceiveMessage { 
  type: 'ReceiveMessage';
  payload: number; 
}

export interface WebSocketSynchronizeUserFinished {
  type: 'SynchronizeUserFinished';
  payload: ApiUserResponse;
}

export type WebSocketResponse = WebSocketReceiveMessage | WebSocketSynchronizeUserFinished;

@Injectable({
  providedIn: "root",
})
export class WebsocketService implements OnDestroy {
  private socket?: WebSocket;
  private messages$ = new Subject<WebSocketResponse>();
  userSync$ = new Subject<ApiUserResponse>();
  receiveMessage$ = new Subject<number>();

  constructor(private ngZone: NgZone) {}

  connect(url: string): Observable<WebSocketResponse> {
    this.socket = new WebSocket(url);

    this.socket.onopen = (event: Event) => {
      console.log("WebSocket connected:", url);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      this.ngZone.run(() => {
        const message = event.data;
        this.handleWebSocketMessage(message);
      });
    };

    this.socket.onerror = (event: Event) => {
      console.error("WebSocket error - check server URL/port:", url, event);
    };

    this.socket.onclose = (event: CloseEvent) => {
      console.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
      this.socket = undefined;
      if (event.code === 1000) {
        this.completeAllSubjects();
      }
    };

    return merge(
      this.userSync$.pipe(map(user => ({ type: 'SynchronizeUserFinished' as const, payload: user }))),
      this.receiveMessage$.pipe(map(num => ({ type: 'ReceiveMessage' as const, payload: num })))
    ) as Observable<WebSocketResponse>;
  }

  private handleWebSocketMessage(msg: string): void {
    try {
      const response: WebSocketResponse = JSON.parse(msg);
      console.log('WebSocket response:', response);
      
      this.messages$.next(response);
      
      switch (response.type) {
        case 'SynchronizeUserFinished':
          this.userSync$.next(response.payload as ApiUserResponse);
          break;
        case 'ReceiveMessage':
          this.receiveMessage$.next(response.payload as number);
          break;
        default:
          console.warn('Unknown message type:', response);
      }
    } catch (parseError) {
      console.error('Failed to parse WebSocket message:', parseError, msg);
    }
  }

  sendMessage(msg: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(msg);
    } else {
      console.warn("WebSocket not open (readyState:", this.socket?.readyState, "). Message not sent.");
    }
  }

  ngOnDestroy(): void {
    this.socket?.close(1000, "Service destroyed");
    this.completeAllSubjects();
  }

  private completeAllSubjects(): void {
    this.messages$.complete();
    this.userSync$.complete();
    this.receiveMessage$.complete();
  }
}
