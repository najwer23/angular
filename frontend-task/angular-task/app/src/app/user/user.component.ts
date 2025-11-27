import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { BehaviorSubject, Subscription } from "rxjs";
import { WebsocketService } from "../services/websocket.service";
import { UserModel } from "app/store/store.types";
import { UserService } from "app/services/user.service";

@Component({
  selector: "app-user",
  templateUrl: "user.component.html",
  styleUrls: ["user.component.scss"],
  imports: [CommonModule],
})
export class UserComponent implements OnInit, OnDestroy {
  isFavorite$ = new BehaviorSubject<boolean>(false);
  user!: UserModel;
  userId = 0;
  userProtectedProjects = 0;
  userUsername = ''

  private subscriptions = new Subscription();

  constructor(
    public userService: UserService,
    public webSocketService: WebsocketService,
    public router: Router,
    private route: ActivatedRoute, 
    public store: Store,
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
    const isFav = this.isUserFavorite();
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

  isUserFavorite() {
    const userListState = sessionStorage.getItem('userListState');
    if (userListState) {
      const state = JSON.parse(userListState);
      return state.favoriteUserIds.includes(this.userId);
    }
    return false;
  }

  removeFromFavorites() {
    const userListState = sessionStorage.getItem('userListState');
    if (userListState) {
      const state = JSON.parse(userListState);
      const index = state.favoriteUserIds.indexOf(this.userId);
      if (index > -1) {
        state.favoriteUserIds.splice(index, 1);
        sessionStorage.setItem('userListState', JSON.stringify(state));
        this.updateFavoriteStatus();  
      }
    }
  }

  addToFavorites() {
    const userListState = sessionStorage.getItem('userListState');
    if (userListState) {
      const state = JSON.parse(userListState);
      const index = state.favoriteUserIds.indexOf(this.userId)
      if (index < 0) {
        state.favoriteUserIds.push(this.userId)
        sessionStorage.setItem('userListState', JSON.stringify(state));
        this.updateFavoriteStatus();  
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
