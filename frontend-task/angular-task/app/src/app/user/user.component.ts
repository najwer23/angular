import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, Subscription } from "rxjs";
import { WebsocketService } from "../services/websocket.service";
import { ApiUserModel, UserService } from "app/services/user.service";
import { SessionStorageService } from "app/services/sessionStorage.service";

interface WebSocketResponse {
  type: string;
  payload: ApiUserModel;
}

@Component({
  selector: "app-user",
  templateUrl: "user.component.html",
  styleUrls: ["user.component.scss"],
  imports: [CommonModule],
  standalone: true
})
export class UserComponent implements OnInit, OnDestroy {
  isFavorite$ = new BehaviorSubject<boolean>(false);
  userId = 0;
  userProtectedProjects = 0;
  userUsername = '';
  errorMessage = '';

  private subscriptions = new Subscription();

  constructor(
    public userService: UserService,
    public webSocketService: WebsocketService,
    public router: Router,
    private route: ActivatedRoute, 
    private sessionStorage: SessionStorageService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.route.paramMap.subscribe({
        next: (params) => {
          const userIdStr = params.get('id');
          if (userIdStr) {
            const userIdNum = parseInt(userIdStr, 10);
            if (!isNaN(userIdNum)) {
              this.loadUser(userIdNum);
            } else {
              this.handleError('Invalid user ID format');
            }
          } else {
            this.handleError('No user ID found in route');
          }
        },
        error: (err) => this.handleError('Failed to read route parameters: ' + err.message)
      })
    );

    this.subscriptions.add(
      this.webSocketService.subject.subscribe({
        next: (msg) => this.handleWebSocketMessage(msg),
        error: (err) => console.error('WebSocket error:', err)
      })
    );
  }

  private loadUser(userId: number) {
    this.errorMessage = '';
    
    this.subscriptions.add(
      this.userService.getUser(userId.toString()).subscribe({
        next: (user: ApiUserModel) => {
          this.userId = user.id;
          this.userUsername = user.name || '';
          this.userProtectedProjects = user.protectedProjects || 0;
          this.updateFavoriteStatus();
        },
        error: (err) => {
          console.error('Failed to load user:', err);
          this.handleError(`Failed to load user ${userId}: ${err.message}`);
        }
      })
    );
  }

  private handleWebSocketMessage(msg: string) {
    try {
      const response: WebSocketResponse = JSON.parse(msg);
      console.log('WebSocket response:', response);
      
      if (response.payload && typeof response.payload.id === 'number') {
        console.log('WebSocket user update:', response.payload.id);
        this.loadUser(response.payload.id);
      } else {
        console.warn('Invalid WebSocket payload:', response.payload);
      }
    } catch (parseError) {
      console.error('Failed to parse WebSocket message:', parseError, msg);
    }
  }

  private handleError(message: string) {
    this.errorMessage = message;
    console.error(message);
  }

  updateFavoriteStatus() {
    const isFav = this.sessionStorage.isUserFavorite(this.userId);
    this.isFavorite$.next(isFav);
  }

  goBack() {
    this.router.navigate(["/"]);
  }

  synchronizeUser() {
    const message = JSON.stringify({
      type: "SynchronizeUser",
      payload: this.userId - 1,
    });
    this.webSocketService.sendMessage(message);
  }

  addToFavorites() {
    this.sessionStorage.addUserToFavorites(this.userId);
    this.updateFavoriteStatus();
  }

  removeFromFavorites() {
    this.sessionStorage.removeUserFromFavorites(this.userId);
    this.updateFavoriteStatus();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
