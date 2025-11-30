import { Component, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageService } from '../../../core/services/language-service';
import { Lang } from '../../../core/models/Language';

@Component({
  selector: 'app-language-switcher',
  imports: [],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  private translocoService = inject(TranslocoService);
  private service = inject(LanguageService);

  activeLanguage = this.service.activeLang;

  setLanguage(lang: Lang): void {
    this.service.setLang(lang);
  }
}
