import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebSocketResponse, WebsocketService } from './services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';
  private subscriptions = new Subscription();

  constructor(
    public webSocketService: WebsocketService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.webSocketService.connect('ws://localhost:9334/notificationHub').subscribe({
        next: (response: WebSocketResponse) => console.log('Typed WebSocket response:', response),
        error: (err) => console.error('WebSocket error:', err)
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
