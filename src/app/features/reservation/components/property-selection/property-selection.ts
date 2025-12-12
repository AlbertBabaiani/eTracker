import { Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Property } from '../../../../shared/models/Property';
import { TruncatePipe } from '../../../../shared/pipes/truncate-pipe';

@Component({
  selector: 'app-property-selection',
  imports: [MatIcon, TruncatePipe],
  templateUrl: './property-selection.html',
  styleUrl: './property-selection.scss',
})
export class PropertySelection {
  properties = input.required<Property[]>();
  selectedPropertyId = input.required<string | null>();

  selectProperty = output<string | null>();

  chooseProperty(propertyId: string | null) {
    if (propertyId === this.selectedPropertyId() && this.selectedPropertyId !== null) {
      this.selectProperty.emit(null);
    } else {
      this.selectProperty.emit(propertyId);
    }
  }
}
