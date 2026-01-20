import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { UserDetails } from '../models/users';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  private setCookie(name: string, value: string, days = 1): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
  }

  private getCookie(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  private deleteCookie(name: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
  }

  public logOut(): void {
    this.deleteCookie(TOKEN_KEY);
    this.deleteCookie(USER_KEY);
    this.router.navigate(['/signin']);
  }

  public saveToken(token: string): void {
    this.setCookie(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return this.getCookie(TOKEN_KEY);
  }

  public saveUser(user: UserDetails): void {
    this.setCookie(USER_KEY, JSON.stringify(user));
  }

  public getUser(): UserDetails | null {
    const user = this.getCookie(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }
}