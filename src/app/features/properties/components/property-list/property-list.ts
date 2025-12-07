import { Component, inject } from '@angular/core';
import { PropertyService } from '../../../../core/services/property-service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { TruncatePipe } from '../../../../shared/pipes/truncate-pipe';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-property-list',
  imports: [
    RouterLink,
    TruncatePipe,
    TitleCasePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDivider,
  ],
  templateUrl: './property-list.html',
  styleUrl: './property-list.scss',
})
export class PropertyList {
  private propertyService = inject(PropertyService);
  properties = this.propertyService.properties;
}
