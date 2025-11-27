import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, Subscription } from "rxjs";
import { WebsocketService } from "../services/websocket.service";
import { UserService } from "app/services/user.service";
import { SessionStorageService } from "app/services/sessionStorage.service";

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

  private subscriptions = new Subscription();

  constructor(
    public userService: UserService,
    public webSocketService: WebsocketService,
    public router: Router,
    private route: ActivatedRoute, 
    private sessionStorage: SessionStorageService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const userId = params.get('id');
      if (userId) {
        this.userService.getUser(userId).subscribe(user => {
          this.userUsername = user.name;
          this.userProtectedProjects = user.protectedProjects;
          this.userId = user.id;
          this.updateFavoriteStatus();  
        });
      }
    });

    this.subscriptions.add(
      this.webSocketService.subject.subscribe(msg => {
        const response = JSON.parse(msg);
        const user = response.payload;
        console.error("Failed to load user: ", user.id);
      })
    );
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
      payload: this.userUsername,
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
