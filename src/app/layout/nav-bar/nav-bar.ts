import { Component, inject, signal } from '@angular/core';
import { Logo } from '../../shared/components/logo/logo';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth-service';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';

@Component({
  selector: 'app-nav-bar',
  imports: [Logo, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, LanguageSwitcher],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {
  private authService = inject(AuthService);

  user = this.authService.currentUser;
  isCollapsed = signal(true);

  toggleMenu() {
    this.isCollapsed.update((v) => !v);
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout(): void {
    this.authService.logout();
  }
}
