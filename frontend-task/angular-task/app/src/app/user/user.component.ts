import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, Subscription } from "rxjs";
import { WebSocketResponse, WebsocketService } from "../services/websocket.service";
import { ApiUserResponse, UserService } from "app/services/user.service";
import { SessionStorageService } from "app/services/sessionStorage.service";

@Component({
  selector: "app-user",
  templateUrl: "user.component.html",
  styleUrls: ["user.component.scss"],
  imports: [CommonModule],
})
export class UserComponent implements OnInit, OnDestroy {
  isFavorite$ = new BehaviorSubject<boolean>(false);
  userId = 0;
  userProtectedProjects = 0;
  userUsername = '';

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
              this.userId = userIdNum;
              this.loadUser(userIdNum);
            } else {
              console.error('Invalid user ID format');
            }
          } else {
            console.error('No user ID found in route');
          }
        },
        error: (err) => console.error('Failed to read route parameters: ' + err.message)
      })
    );

    this.subscriptions.add(
      this.webSocketService.subject.subscribe({
        next: (msg) => console.log('Raw WebSocket message:', msg),
        error: (err) => console.error('WebSocket error:', err)
      })
    );

    this.subscriptions.add(
      this.webSocketService.userSync$.subscribe({
        next: (user) => this.handleUserSync(user),
        error: (err) => console.error('User sync error:', err)
      })
    );
  }

  private loadUser(userId: number): void {    
    this.subscriptions.add(
      this.userService.getUser(userId.toString()).subscribe({
        next: (user: ApiUserResponse) => {
          this.userId = user.id;
          this.userUsername = user.name || '';
          this.userProtectedProjects = user.protectedProjects || 0;
          this.updateFavoriteStatus();
        },
        error: (err) => {
          console.error('Failed to load user:', err);
          console.error(`Failed to load user ${userId}: ${err.message}`);
        }
      })
    );
  }

  handleUserSync(user: ApiUserResponse): void {
    if (user.id === this.userId) {
      console.log('User synchronized:', user.protectedProjects);
      this.userProtectedProjects = user.protectedProjects || 0;
    }
  }

  updateFavoriteStatus(): void {
    const isFav = this.sessionStorage.isUserFavorite(this.userId);
    this.isFavorite$.next(isFav);
  }

  goBack(): void {
    this.router.navigate(["/"]);
  }

  synchronizeUser(): void {
    if (this.userId > 0) {
      const message = JSON.stringify({
        type: "SynchronizeUser",
        payload: this.userId - 1,
      });
      console.log('Syncing user:', this.userId);
      this.webSocketService.sendMessage(message);
    } else {
      console.warn('No user loaded for synchronization');
    }
  }

  addToFavorites(): void {
    this.sessionStorage.addUserToFavorites(this.userId);
    this.updateFavoriteStatus();
  }

  removeFromFavorites(): void {
    this.sessionStorage.removeUserFromFavorites(this.userId);
    this.updateFavoriteStatus();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
