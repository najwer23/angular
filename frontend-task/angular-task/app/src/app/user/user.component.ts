import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { addUserToFavorite, removeUserFromFavorite, setCurrentUser } from "app/store/store.actions";
import { selectCurrentUser, selectFavoriteUsers } from "app/store/store.selectors";
import { Subscription } from "rxjs";
import { WebsocketService } from "../services/websocket.service";
import { UserModel } from "app/store/store.types";

@Component({
  selector: "app-user",
  templateUrl: "user.component.html",
  styleUrls: ["user.component.scss"],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit, OnDestroy {
  userName: string | undefined;
  protectedProjects: number = 0;
  userId: number | undefined;
  user!: UserModel;

  favoriteUsers$ = this.store.select(selectFavoriteUsers);

  private userSubscription!: Subscription;
  private webSocketSubscription!: Subscription;

  constructor(
    public webSocketService: WebsocketService,
    public router: Router,
    public store: Store,
  ) {}

  ngOnInit() {
    this.userSubscription = this.store.select(selectCurrentUser).subscribe((user) => {
      if (user) {
        this.userName = user.name;
        this.protectedProjects = user.protectedProjects;
        this.userId = user.id;
        this.user = user;
      }
    });

    this.webSocketSubscription = this.webSocketService.subject.subscribe((msg) => {
      const response = JSON.parse(msg);
      const user = response.payload;
      console.error("Failed to load user: ", user.id);
      this.store.dispatch(setCurrentUser({ user }));
    });
  }

  isUserFavorite(favoriteUsers: UserModel[] | null) {
    if (!favoriteUsers) return false;
    return !!favoriteUsers.find((u) => u.id === this.userId);
  }

  isNotUserFavorite(favoriteUsers: UserModel[]| null) {
    if (!favoriteUsers) return false;
    return !favoriteUsers.find((u) => u.id === this.userId);
  }

  goBack() {
    this.router.navigate(["/"]);
  }

  synchronizeUser() {
    console.log("starting synchronization");
    const message = JSON.stringify({
      type: "SynchronizeUser",
      payload: this.userName,
    });
    this.webSocketService.sendMessage(message);
  }

  removeFromFavorites() {
    this.store.dispatch(removeUserFromFavorite({ user: this.user }));
  }

  addToFavorites() {
    this.store.dispatch(addUserToFavorite({ user: this.user }));
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.webSocketSubscription?.unsubscribe();
  }
}
