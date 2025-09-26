import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrentSvgService {
  private readonly _currentSvgId = signal<string | null>(null);

  readonly currentSvgId = this._currentSvgId.asReadonly();

  setCurrentSvgId(id: string | null): void {
    this._currentSvgId.set(id);
  }

  clearCurrentSvgId(): void {
    this._currentSvgId.set(null);
  }
}
