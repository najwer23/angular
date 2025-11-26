import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
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
} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { UserService } from '../services/user.service';
import { WebsocketService } from '../services/websocket.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { setCurrentUser } from '../store/store.actions';
import { selectFavoriteUsers } from 'app/store/store.selectors';
import { CommonModule } from '@angular/common';

export interface UserModel {
  id: number | string;
  name: any;
  role: any;
  email: any;
  protectedProjects: number;
  fav?: boolean; // optional favorite flag
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
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
  ],
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'role', 'protectedProjects', 'favorite'];
  users = new MatTableDataSource<UserModel>([]);

  favoriteUsers: UserModel[] = [];

  private userSub!: Subscription;
  private wsSub!: Subscription;
  private favSub!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public userService: UserService,
    public websocketService: WebsocketService,
    public router: Router,
    public store: Store
  ) {}

  ngOnInit(): void {
    this.favSub = this.store.select(selectFavoriteUsers).subscribe((favs) => {
      this.favoriteUsers = favs;
      this.updateUsersWithFavorites();
    });

    this.loadUsers();

    this.wsSub = this.websocketService
      .connect('ws://localhost:9334/notificationHub')
      .subscribe((msg) => {
        console.log('New message:', msg);
      });
  }

  loadUsers() {
    this.userSub = this.userService.getUsers().subscribe((data) => {
      const updatedUsers = data.map((user: {id: number}) => ({
        ...user,
        fav: this.favoriteUsers.some((favUser) => favUser.id === user.id),
      }));

      this.users = new MatTableDataSource(updatedUsers);
      this.users.paginator = this.paginator;
      this.users.sort = this.sort;
    });
  }

  updateUsersWithFavorites() {
    if (!this.users.data.length) return;

    const updatedUsers = this.users.data.map((user) => ({
      ...user,
      fav: this.favoriteUsers.some((favUser) => favUser.id === user.id),
    }));

    this.users.data = updatedUsers;
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
    this.userSub?.unsubscribe();
    this.wsSub?.unsubscribe();
    this.favSub?.unsubscribe();
  }
}
