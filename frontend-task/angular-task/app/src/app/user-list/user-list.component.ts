import { CommonModule, DatePipe } from "@angular/common";
import { Component, inject, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSort, MatSortModule } from "@angular/material/sort";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from "@angular/material/table";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { I18NEXT_SERVICE, I18NextPipe, ITranslationService } from "angular-i18next";
import { selectFavoriteUsers } from "app/store/store.selectors";
import { Subscription } from "rxjs";
import { UserService } from "../services/user.service";
import { WebsocketService } from "../services/websocket.service";
import { setCurrentUser } from "../store/store.actions";
import { UserModel } from "app/store/store.types";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
  selector: "app-user-list",
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.scss"],
  imports: [
    CommonModule,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
    MatPaginator,
    MatTableModule,
    MatSort,
    MatSortModule,
    MatSnackBarModule,
    I18NextPipe,
    MatInputModule,
    MatFormFieldModule,
  ],
  providers: [DatePipe],
})
export class UserListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ["name", "role", "protectedProjects", "favorite"];
  users = new MatTableDataSource<UserModel>([]);
  favoriteUsers: UserModel[] = [];

  private subscriptions = new Subscription();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private i18next = inject(I18NEXT_SERVICE) as ITranslationService;

  constructor(
    public userService: UserService,
    public websocketService: WebsocketService,
    public router: Router,
    public store: Store,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.i18next.changeLanguage("es");

    const favSub = this.store.select(selectFavoriteUsers).subscribe((favs) => {
      this.favoriteUsers = favs;
      this.updateUsersWithFavorites();
    });
    this.subscriptions.add(favSub);

    this.loadUsers();

    const wsSub = this.websocketService
      .connect("ws://localhost:9334/notificationHub")
      .subscribe((msg) => {
        try {
          const parsed = JSON.parse(msg);
          if (parsed.type === "ReceiveMessage" && parsed.payload) {
            const formattedTime = this.datePipe.transform(new Date(parsed.payload), "medium");
            this.snackBar.open(`Message received at ${formattedTime || "Unknown time"}`, "Close", {
              duration: 5000,
              verticalPosition: "top",
              horizontalPosition: "right",
            });
          }
        } catch {}
      });
    this.subscriptions.add(wsSub);
  }

  loadUsers() {
    const userSub = this.userService.getUsers().subscribe((data) => {
      this.users = new MatTableDataSource(data.map((user) => ({
        ...user,
        favorite: this.favoriteUsers.some((favUser) => favUser.id === user.id),
      })));
      this.users.paginator = this.paginator;
      this.users.sort = this.sort;

      this.users.sortingDataAccessor = this.sortingDataAccessor;
      this.users.filterPredicate = this.filterPredicate;
    });
    this.subscriptions.add(userSub);
  }

  sortingDataAccessor = (item: UserModel, property: string): string | number => {
    switch (property) {
      case "favorite":
        return item.favorite ? 1 : 0;
      case "name":
        return item.name.toLowerCase();
      case "role":
        return item.role.toLowerCase();
      case "protectedProjects":
        return item.protectedProjects;
      default:
        return "";
    }
  };

  filterPredicate = (data: UserModel, filter: string): boolean => {
    const transformedFilter = filter.trim().toLowerCase();
    const favString = data.favorite ? "yes" : "no";
    const dataStr = `${data.name} ${data.role} ${data.protectedProjects} ${favString}`.toLowerCase();
    return dataStr.includes(transformedFilter);
  };

  updateUsersWithFavorites() {
    if (!this.users.data.length) return;

    this.users.data = this.users.data.map((user) => ({
      ...user,
      favorite: this.favoriteUsers.some((favUser) => favUser.id === user.id),
    }));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.users.filter = filterValue.trim().toLowerCase();
    if (this.users.paginator) {
      this.users.paginator.firstPage();
    }
  }

  userDetails(user: UserModel) {
    this.store.dispatch(setCurrentUser({ user }));
    this.router.navigate([user.id]);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
