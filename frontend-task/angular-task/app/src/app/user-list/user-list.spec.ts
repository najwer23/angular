import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { inject, provideAppInitializer } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { I18NEXT_SERVICE, provideI18Next } from "angular-i18next";
import { UserListComponent } from "./user-list.component";
import { TRANS } from "app/app.trans";
import { MatTableDataSource } from "@angular/material/table";
import { UserModel } from "app/store/store.types";
import { of } from "rxjs";
import { UserService } from "../services/user.service";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { WebsocketService } from "../services/websocket.service";
import { setCurrentUser } from "../store/store.actions";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

describe("UserListComponent", () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockStore: any;

  const mockUsers: UserModel[] = [
    {
      id: 1,
      name: "Alice",
      role: "Admin",
      email: "alice@example.com",
      protectedProjects: 3,
      favorite: false,
    },
    {
      id: 2,
      name: "Bob",
      role: "User",
      email: "bob@example.com",
      protectedProjects: 1,
      favorite: false,
    },
  ];

  const mockApiResponse = {
    results: [
      { id: 1, name: "Alice", role: "Admin", email: "alice@example.com", protectedProjects: 3 },
      { id: 2, name: "Bob", role: "User", email: "bob@example.com", protectedProjects: 1 },
    ],
    total: 2
  };

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['getUsers']);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const websocketSpy = jasmine.createSpyObj<WebsocketService>('WebsocketService', ['connect']);

    const storeSpy = jasmine.createSpyObj<Store>('Store', ['dispatch', 'select']);
    storeSpy.select.and.returnValue(of([])); 

    userServiceSpy.getUsers.and.returnValue(of(mockApiResponse));
    websocketSpy.connect.and.returnValue(of('{"type": "ReceiveMessage", "payload": 1234567890}'));

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        provideMockStore({}),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18Next(),
        provideAppInitializer(() => {
          const i18next = inject(I18NEXT_SERVICE);
          return i18next.init(TRANS);
        }),
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: WebsocketService, useValue: websocketSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    mockUserService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockStore = TestBed.inject(Store);

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe from all subscriptions on destroy', () => {
    spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
  });

  it("should load users and update the data source", () => {
    component.loadUsers();
    fixture.detectChanges(); 

    expect(component.users).toEqual(jasmine.any(MatTableDataSource));
    expect(component.users.data.length).toBe(2);
    expect(component.users.data[0].name).toBe("Alice");
  });

  it('should navigate to user details on userDetails click', () => {
    const user = mockUsers[0];
    
    component.userDetails(user);
    
    expect(mockStore.dispatch).toHaveBeenCalledWith(setCurrentUser({ user }));
    expect(mockRouter.navigate).toHaveBeenCalledWith([user.id]);
  });

  it('should apply filter and reload users with filter value', () => {
    const componentWithViewChildren = component as UserListComponent & {
      paginator: MatPaginator | undefined;
      sort: MatSort | undefined;
    };

    componentWithViewChildren.paginator = {
      pageIndex: 0,
      pageSize: 5,
      length: 0
    } as MatPaginator;

    componentWithViewChildren.sort = {
      active: '',
      direction: ''
    } as MatSort;

    const mockTarget = { value: 'alice' } as HTMLInputElement;
    const filterEvent = { target: mockTarget } as unknown as Event;

    component.applyFilter(filterEvent);
    fixture.detectChanges();

    expect((component).filterValue).toBe('alice');
    expect(mockUserService.getUsers).toHaveBeenCalledWith(1, 5, {
      filter: 'alice',
      sort: ''
    });
  });
});
