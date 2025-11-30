import { inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Lang } from '../models/Language';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly STORAGE_KEY = 'app-language';
  private transloco = inject(TranslocoService);

  private _activeLang = signal<Lang>('en');
  readonly activeLang = this._activeLang.asReadonly();

  initLanguage(): void {
    const savedLang = localStorage.getItem(this.STORAGE_KEY) as Lang | null;
    const defaultLang = this.transloco.getDefaultLang() as Lang;

    const langToUse = savedLang || defaultLang;

    this.transloco.setActiveLang(langToUse);
    this._activeLang.set(langToUse);
  }

  setLang(lang: Lang): void {
    this.transloco.setActiveLang(lang);

    localStorage.setItem(this.STORAGE_KEY, lang);

    this._activeLang.set(lang);
  }
}
