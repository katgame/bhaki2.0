import { HTTP_INTERCEPTORS, HttpHandler, HttpInterceptor, HttpRequest, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { ToastService } from './toast.service';
import { SpinnerService } from './spinner-service';

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private token: TokenStorageService,
    private spinnerService: SpinnerService,
    private router: Router,
    private toastService: ToastService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinnerService.show();
    let headers = req.headers
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    const token = this.token.getToken();
    if (token) {
      headers = headers.set(TOKEN_HEADER_KEY, `Bearer ${token}`);
    }

    const authReq = req.clone({ headers });

    return next.handle(authReq).pipe(
      map((event: any) => {
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 400:
            // Bad request - let component handle specific error messages
            break;
          case 401:
            // Check if this is a login request - if so, let the component handle the error
            const isLoginRequest = req.url.includes('login-user');
            if (!isLoginRequest) {
              // For non-login 401 errors, redirect to signin and show message
              this.toastService.error('Your session has expired. Please log in again.', 5000);
              this.router.navigate(['signin']);
            }
            // For login requests, let the component handle the error message
            break;
          case 403:
            // Forbidden - let component handle
            break;
          case 409:
            // Conflict - Duplicate registration or other conflict errors
            const isRegistrationRequest = req.url.includes('add-registration');
            const isDuplicateRegistration = error?.error?.errorCode === 'DUPLICATE_REGISTRATION';
            
            if (isDuplicateRegistration || isRegistrationRequest) {
              const errorMessage = error?.error?.message || 
                                error?.error?.errorMessage || 
                                '⚠️ Duplicate Registration: This student is already registered for the selected course. Please select a different course or verify the student information.';
              this.toastService.show(errorMessage, 'error', 8000);
            }
            break;
          default:
            break;
        }
        // Return the original error so components can still handle it if needed
        return throwError(() => error);
      }),
      finalize(() => {
        this.spinnerService.hide();
      })
    );

  }
}

export const authInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];