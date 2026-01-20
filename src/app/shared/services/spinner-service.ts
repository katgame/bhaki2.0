// spinner.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private activeRequests = 0;
  private _isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this._isLoading.asObservable();

  show() {
    this.activeRequests++;
    if (!this._isLoading.value) {
      this._isLoading.next(true);
    }
  }

  hide() {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    if (this.activeRequests === 0) {
      this._isLoading.next(false);
    }
  }

  reset() {
    this.activeRequests = 0;
    this._isLoading.next(false);
  }
}
