import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable, MatTableDataSource, MatTableModule
} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import { UserService } from '../services/user.service';
import { WebsocketService } from '../services/websocket.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { setCurrentUser } from '../store/store.actions';

export interface UserModel {
  id: number | string;
  name: any;
  role: any;
  email: any;
  protectedProjects: number;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [
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
    MatSortModule
  ],
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'role', 'protectedProjects'];
  users = new MatTableDataSource<UserModel>([]);

  private userSub!: Subscription;
  private wsSub!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public userService: UserService,
    public websocketService: WebsocketService,
    public router: Router,
    public store: Store,
  ) {}

  ngOnInit(): void {
    this.loadUsers();

    this.wsSub = this.websocketService.connect('ws://localhost:9334/notificationHub').subscribe(msg => {
      console.log("New message:", msg);
    });
  }

  loadUsers() {
    this.userSub = this.userService.getUsers().subscribe(data => {
      this.users = new MatTableDataSource(data);
      this.users.paginator = this.paginator;  
      this.users.sort = this.sort;   
    });
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
}
