import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { inject, provideAppInitializer } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatTableDataSource } from "@angular/material/table";
import { provideMockStore } from "@ngrx/store/testing";
import { I18NEXT_SERVICE, provideI18Next } from "angular-i18next";
import { of } from "rxjs";
import { UserListComponent } from "./user-list.component";
import { UserModel } from "app/store/store.types";
import { TRANS } from "app/app.trans";

describe("UserListComponent", () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async () => {
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load users and update the data source", () => {
    const mockUsers: UserModel[] = [
      {
        id: 1,
        name: "Alice",
        role: "Admin",
        email: "alice@example.com",
        protectedProjects: 3,
        fav: false
      },
      {
        id: 2,
        name: "Bob",
        role: "User",
        email: "bob@example.com",
        protectedProjects: 1,
        fav: false
      },
    ];
    spyOn(component.userService, "getUsers").and.returnValue(of(mockUsers));
    component.loadUsers();
    expect(component.users.data.length).toBe(2);
    expect(component.users).toEqual(jasmine.any(MatTableDataSource));
    expect(component.users.data[0].name).toBe("Alice");
  });

  it("should apply filter correctly", () => {
    component.users = new MatTableDataSource<UserModel>([
      {
        id: 1,
        name: "Bob",
        role: "User",
        email: "bob@example.com",
        protectedProjects: 1,
        fav: false
      },
      {
        id: 2,
        name: "Alice",
        role: "Admin",
        email: "alice@example.com",
        protectedProjects: 3,
        fav: false
      },
    ]);
    const event = { target: { value: "Alice" } } as unknown as Event;
    component.applyFilter(event);
    expect(component.users.filteredData.length).toBe(1);
    expect(component.users.filteredData[0].name).toBe("Alice");
  });

  it("should update users with favorites flag", () => {
    component.users = new MatTableDataSource<UserModel>([
      {
        id: 1,
        name: "Alice",
        role: "Admin",
        email: "alice@example.com",
        protectedProjects: 3,
        fav: false,
      },
      {
        id: 2,
        name: "Bob",
        role: "User",
        email: "bob@example.com",
        protectedProjects: 1,
        fav: false,
      },
    ]);
    component.favoriteUsers = [
      {
        id: 1,
        name: "Alice",
        role: "Admin",
        email: "alice@example.com",
        protectedProjects: 3,
        fav: false
      },
    ];
    component.updateUsersWithFavorites();
    expect(component.users.data.find((u) => u.id === 1)?.fav).toBeTrue();
    expect(component.users.data.find((u) => u.id === 2)?.fav).toBeFalse();
  });

  it("should dispatch user details and navigate on userDetails call", () => {
    spyOn(component.store, "dispatch");
    spyOn(component.router, "navigate");
    const user: UserModel = {
      id: 1,
      name: "Alice",
      role: "Admin",
      email: "alice@example.com",
      protectedProjects: 3,
      fav: false
    };
    component.userDetails(user);
    expect(component.store.dispatch).toHaveBeenCalled();
    expect(component.router.navigate).toHaveBeenCalledWith([1]);
  });

  it("should unsubscribe from subscriptions on destroy", () => {
    (component as any).userSub = jasmine.createSpyObj("Subscription", ["unsubscribe"]);
    (component as any).wsSub = jasmine.createSpyObj("Subscription", ["unsubscribe"]);
    (component as any).favSub = jasmine.createSpyObj("Subscription", ["unsubscribe"]);

    component.ngOnDestroy();

    expect((component as any).userSub.unsubscribe).toHaveBeenCalled();
    expect((component as any).wsSub.unsubscribe).toHaveBeenCalled();
    expect((component as any).favSub.unsubscribe).toHaveBeenCalled();
  });
});
