import { toObservable } from '@angular/core/rxjs-interop';
import { Injectable, computed, effect, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { UserDetails } from '../models/users';
import { TokenStorageService } from '../services/token-storage.service';
import { Registration } from '../models/registration';


@Injectable({
    providedIn: 'root'
})
export class AppStore {

    //Create Signal

    private readonly state = {
        $userDetails: signal<UserDetails>({} as UserDetails),
        $registrationDetails: signal<Registration>({} as Registration)
    } as const;

    public readonly $userDetails = toObservable(this.state.$userDetails.asReadonly());
    public readonly $registrationDetails = toObservable(this.state.$registrationDetails.asReadonly());
    private readonly USER_STORAGE_KEY = 'app_user_state';
    constructor(private tokenStorage: TokenStorageService, @Inject(PLATFORM_ID) private platformId: Object) {

        this.hydrateState();

        effect(() => {
            const currentState = {
                userDetails: this.state.$userDetails(),
                registrationDetails: this.state.$registrationDetails()
            };
            if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(currentState));
            }
            const signals = [
                {
                    id: '$userDetails', signal: this.state.$userDetails(),
                },
                {
                     id: '$registrationDetails', signal: this.state.$registrationDetails(),
                }]
        })
        const user = this.tokenStorage.getUser();
        if (user && user.user?.id) {
            this.state.$userDetails.set(user);
        } else {
            this.state.$userDetails.set({} as UserDetails);
        }

    }

    private hydrateState() {
        if (isPlatformBrowser(this.platformId)) {
            const savedState = localStorage.getItem(this.USER_STORAGE_KEY);
            if (savedState) {
                const state = JSON.parse(savedState);
                if (state.userDetails) this.state.$userDetails.set(state.userDetails);
                if (state.registrationDetails) this.state.$registrationDetails.set(state.registrationDetails);
            }
        }
    }

    public setUserDetails(userDetails: UserDetails) {
        this.state.$userDetails.set(userDetails);
    }

    public setRegistrationDetails(registrationDetails: Registration) {
        this.state.$registrationDetails.set(registrationDetails);
    }

    public logout() {
    // Clear signals
    this.state.$userDetails.set({} as UserDetails);

    // Remove  user Carts from localStorage
    if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem(this.USER_STORAGE_KEY);
    }
}
}
