import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	type OnDestroy,
	type OnInit,
} from "@angular/core";
import type { Router } from "@angular/router";
import type { Store } from "@ngrx/store";
import {
	addUserToFavorite,
	removeUserFromFavorite,
	setCurrentUser,
} from "app/store/store.actions";
import {
	selectCurrentUser,
	selectFavoriteUsers,
} from "app/store/store.selectors";
import type { Subscription } from "rxjs";
import type { WebsocketService } from "../services/websocket.service";

@Component({
	selector: "app-user",
	templateUrl: "user.component.html",
	styleUrls: ["user.component.scss"],
	imports: [CommonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit, OnDestroy {
	userName!: any;
	protectedProjects: any = 0;
	userId!: any;
	user: any;

	favoriteUsers$ = this.store.select(selectFavoriteUsers);

	private userSubscription!: Subscription;
	private webSocketSubscription!: Subscription;

	constructor(
		public webSocketService: WebsocketService,
		public router: Router,
		public store: Store,
	) {}

	ngOnInit() {
		this.userSubscription = this.store
			.select(selectCurrentUser)
			.subscribe((user) => {
				if (user) {
					this.userName = user.name;
					this.protectedProjects = user.protectedProjects;
					this.userId = user.id;
					this.user = user;
				}
			});

		this.webSocketSubscription = this.webSocketService.subject.subscribe(
			(msg) => {
				const response = JSON.parse(msg);
				const user = response.payload;
				console.error("Failed to load user: ", user.id);
				this.store.dispatch(setCurrentUser({ user }));
			},
		);
	}

	isUserFavorite(favoriteUsers: any) {
		if (!favoriteUsers) return false;
		return !!favoriteUsers.find((u: any) => u.id === this.userId);
	}

	isNotUserFavorite(favoriteUsers: any) {
		if (!favoriteUsers) return false;
		return !favoriteUsers.find((u: any) => u.id === this.userId);
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
