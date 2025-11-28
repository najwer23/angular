import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebsocketService } from './services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';
  private wsSub!: Subscription;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.wsSub = this.websocketService.connect('ws://localhost:9334/notificationHub').subscribe({
      next: (msg) => {
        console.log("New message:", msg);
      },
      error: (err) => {
        console.error("WebSocket error:", err);
      },
      complete: () => {
        console.log("WebSocket connection closed");
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wsSub) {
      this.wsSub.unsubscribe();
    }
  }
}
