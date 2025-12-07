import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { PropertyService } from '../../../../core/services/property-service';
import { TruncatePipe } from '../../../../shared/pipes/truncate-pipe';

@Component({
  selector: 'app-profile',
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    TitleCasePipe,
    TruncatePipe,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private authService = inject(AuthService);
  private propertyService = inject(PropertyService);

  user = this.authService.currentUser;
  properties = this.propertyService.properties;

  logout(): void {
    this.authService.logout();
  }

  getInitials(displayName?: string, firstName?: string, lastName?: string): string {
    // Priority 1: Display Name
    if (displayName) {
      const parts = displayName.trim().split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }

    // Priority 2: First + Last Name
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }

    return '??';
  }
}
