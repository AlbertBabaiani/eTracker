import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private processQuantity: number = 0;

  startProcess(): void {
    this.processQuantity++;

    if (this.processQuantity === 1) this._isLoading.set(true);
  }

  stopProcess(): void {
    if (this.processQuantity === 0) return;

    this.processQuantity--;

    if (this.processQuantity === 0) this._isLoading.set(false);
  }
}
