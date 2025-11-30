import { Component, inject } from '@angular/core';
import { PropertyService } from '../../../../core/services/property-service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-property-list',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './property-list.html',
  styleUrl: './property-list.scss',
})
export class PropertyList {
  private propertyService = inject(PropertyService);
  properties = this.propertyService.properties;
}
