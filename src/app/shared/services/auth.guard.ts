import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { Injectable } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    
    constructor(
        private router: Router,
        private tokenStorage: TokenStorageService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.tokenStorage.getUser();
        var roles = route.data['roles'];
        if (currentUser) {
            // check if route is restricted by role
            const userRoles = Array.isArray(currentUser.role) ? currentUser.role : [currentUser.role];

            // if the user only has 'clerk' role, redirect to admin-registration
            if (userRoles.length === 1 &&  userRoles[0].toLowerCase() === 'Clerk' || userRoles[0].toLowerCase() === 'Manager') {
               // this.router.navigate(['admin-registration']);
                return false;
            }

            if (roles && roles.some((role: string) => userRoles.includes(role)) === false) {
                // role not authorised so redirect to admin-registration
              // this.router.navigate(['admin-registration']);
                return false;
            } 

            // authorised so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/signin'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}