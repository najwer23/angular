import {ChangeDetectionStrategy, Component} from '@angular/core'
import {WebsocketService} from '../services/websocket.service'
import {Router} from '@angular/router'
import {combineLatest, Subscription, tap} from 'rxjs'
import {userReducer} from 'app/store/store.reducer'
import {Store} from '@ngrx/store'
import {addUserToFavorite, removeUserFromFavorite, setCurrentUser} from 'app/store/store.actions'
import {selectCurrentUser, selectFavoriteUsers} from 'app/store/store.selectors'
import {CommonModule} from '@angular/common'

@Component({
  selector: 'app-user',
  templateUrl: 'user.component.html',
  styleUrls: ['user.component.scss'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent {
  userName!: any
  protectedProjects: any = 0
  projectsSub!: Subscription
  userId!: any
  user: any

  user$ = this.store.select(selectCurrentUser).subscribe(user => {
    //@ts-ignore
    this.userName = user.name
    //@ts-ignore
    this.protectedProjects = user.protectedProjects
    //@ts-ignore
    this.userId = user.id
    //@ts-ignore
    this.user = user
  })

  favoriteUsers$ = this.store.select(selectFavoriteUsers)

  constructor(public webSocketService: WebsocketService, public router: Router, public store: Store) {
  }

  ngOnInit() {
    this.webSocketService.subject.subscribe(msg => {
      const response = JSON.parse(msg)

      const user = response.payload
      console.error('Failed to load user: ', user.id)

      this.store.dispatch(setCurrentUser({user}))
    })
  }

  isUserFavorite(favoriteUsers: any) {
    // @ts-ignore
    return !!favoriteUsers.find(u => u.id === this.userId)
  }

  isNotUserFavorite(favoriteUsers: any) {
    // @ts-ignore
    return !favoriteUsers.find(u => u.id === this.userId)
  }

  goBack() {
    this.router.navigate([])
  }

  synchronizeUser() {
    console.log('starting synchronization')
    const message = JSON.stringify({
      type: 'SynchronizeUser',
      payload: this.userName,
    })
    this.webSocketService.sendMessage(message)
  }

  removeFromFavorites() {
    this.store.dispatch(removeUserFromFavorite({ user: this.user }))
  }

  addToFavorites(){
    this.store.dispatch(addUserToFavorite({user: this.user}))

  }
}
