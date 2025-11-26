import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {WebsocketService} from './services/websocket.service'
import {Subscription} from 'rxjs'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'app';
  private wsSub!: Subscription;

  constructor(private websocketService: WebsocketService) {
  }

  ngOnInit() {
    this.wsSub = this.websocketService.connect('ws://localhost:9334/notificationHub').subscribe(msg => {
      console.log("New message:", msg);
    });
  }
}
