import { Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Property } from '../../../../core/models/Property';
import { PropertyService } from '../../../../core/services/property-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-preview-property',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatCardModule, MatDividerModule],
  templateUrl: './preview-property.html',
  styleUrl: './preview-property.scss',
})
export class PreviewProperty {
  private service = inject(PropertyService);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  private routeParams = toSignal(this.route.paramMap);

  property = computed<Property | undefined>(() => {
    const params = this.routeParams();
    const id = params?.get('id');
    return id ? this.service.getPropertyById(id) : undefined;
  });

  goBack(): void {
    this.location.back();
  }

  copyToClipboard(text: string, platform: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.snackBar.open(`${platform} link copied to clipboard!`, 'OK', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
        this.snackBar.open('Failed to copy to clipboard', 'Retry', { duration: 3000 });
      });
  }
}
