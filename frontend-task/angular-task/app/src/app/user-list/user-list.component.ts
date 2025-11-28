import { CommonModule, DatePipe } from "@angular/common";
import { Component, inject, OnInit, ViewChild, OnDestroy, AfterViewInit } from "@angular/core";
import { MatPaginator, MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSort, MatSortModule, Sort } from "@angular/material/sort";
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
import { I18NEXT_SERVICE, I18NextPipe, ITranslationService } from "angular-i18next";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { UserService } from "../services/user.service";
import { WebsocketService } from "../services/websocket.service";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { SessionStorageService, UserListState } from "app/services/sessionStorage.service";

export interface UserModel{
  id: number;
  name: string;
  role: string;
  email: string;
  protectedProjects: number;
  favorite: boolean;
}

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
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatSnackBarModule,
    I18NextPipe,
    MatInputModule,
    MatFormFieldModule,
  ],
  providers: [DatePipe],
})
export class UserListComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ["name", "role", "email", "protectedProjects", "favorite"];
  users = new MatTableDataSource<UserModel>([]);

  pageSizeOptions = [5, 10, 25, 50];
  defaultPageSize = 5;

  private subscriptions = new Subscription();
  private destroy$ = new Subject<void>();
  private filterSubject$ = new Subject<string>();
  private restoringState = false;
  
  currentState: UserListState = {
    pageIndex: 0,
    pageSize: 5,
    sortActive: '',
    sortDirection: '',
    filterValue: '',
    favoriteUserIds: []
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private i18next = inject(I18NEXT_SERVICE) as ITranslationService;

  get filterValue(): string {
    return this.currentState.filterValue;
  }

  set filterValue(value: string) {
    this.currentState.filterValue = value;
    this.saveState();
  }

  constructor(
    public userService: UserService,
    public webSocketService: WebsocketService,
    public router: Router,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private sessionStorage: SessionStorageService
  ) {}

  ngOnInit(): void {
    this.i18next.changeLanguage("es");
    this.restoreState();

    this.subscriptions.add(
      this.webSocketService.receiveMessage$.subscribe((payload) => {
        try {
          const formattedTime = this.datePipe.transform(new Date(payload), "medium");
          this.snackBar.open(`Message received at ${formattedTime || "Unknown time"}`, "Close", {
            duration: 5000,
            verticalPosition: "top",
            horizontalPosition: "right",
          });
        } catch {}
      })
    );

    this.filterSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((filterValue: string) => {
        this.currentState.filterValue = filterValue;
        this.saveState();
        if (this.paginator) {
          this.paginator.pageIndex = 0;
          this.currentState.pageIndex = 0;
          this.loadUsers();
        }
      });
  }

  ngAfterViewInit() {
    this.users.sort = this.sort;
    this.users.sortingDataAccessor = this.sortingDataAccessor;
    this.users.filterPredicate = this.filterPredicate;

    this.subscriptions.add(
      this.paginator.page.subscribe((event: PageEvent) => {
        this.currentState.pageIndex = event.pageIndex;
        this.currentState.pageSize = event.pageSize;
        this.saveState();
        this.loadUsers();
      })
    );

    this.subscriptions.add(
      this.sort.sortChange.subscribe((event: Sort) => {
        this.currentState.sortActive = event.active;
        this.currentState.sortDirection = event.direction || '';

        if (!this.restoringState) {
          this.paginator.pageIndex = 0;
          this.currentState.pageIndex = 0;
        }

        this.saveState();
        this.loadUsers();
      })
    );

    this.restoringState = true; 

    if (this.paginator) {
      this.paginator.pageIndex = this.currentState.pageIndex;
      this.paginator.pageSize = this.currentState.pageSize;
    }

    this.loadUsers();

    if (this.sort && this.currentState.sortActive) {
      Promise.resolve().then(() => {
        this.sort.active = this.currentState.sortActive;
        this.sort.direction = this.currentState.sortDirection as 'asc' | 'desc';
        this.sort.sortChange.emit({
          active: this.sort.active,
          direction: this.sort.direction
        });
        this.restoringState = false; 
      });
    } else {
      this.restoringState = false;
    }
  }

  onFilterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value.trim().toLowerCase();
    this.filterSubject$.next(value);
  }

  loadUsers() {
    const pageIndex = this.paginator ? this.paginator.pageIndex : this.currentState.pageIndex;
    const pageSize = this.paginator ? this.paginator.pageSize : this.currentState.pageSize;
    const sortActive = this.sort ? this.sort.active : this.currentState.sortActive;
    const sortDirection = this.sort ? this.sort.direction : this.currentState.sortDirection;

    let sortParam = '';
    if (sortActive && sortDirection) {
      sortParam = sortDirection === 'asc' ? sortActive : `-${sortActive}`;
    }

    this.userService.getUsers(pageIndex + 1, pageSize, { 
      sort: sortParam, 
      filter: this.currentState.filterValue 
    }).subscribe((data) => {
      this.users.data = data.results.map((user) => ({
        ...user,
        favorite: this.sessionStorage.isUserFavorite(user.id)
      }));

      if (this.paginator) {
        this.paginator.length = data.total;
      }
      this.saveState();
    });
  }

  private saveState() {
    this.sessionStorage.setUserListState(this.currentState);
  }

  private restoreState() {
    const savedState = this.sessionStorage.getUserListState();
    if (savedState) {
      this.currentState = { ...this.currentState, ...savedState };
    }
  }

  sortingDataAccessor = (item: UserModel, property: string): string | number => {
    switch (property) {
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
    const dataStr = `${data.name} ${data.role} ${data.protectedProjects}`.toLowerCase();
    return dataStr.includes(transformedFilter);
  };

  userDetails(user: UserModel) {
    this.router.navigate([user.id]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }
}
