import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-year-grid',
  imports: [],
  templateUrl: './year-grid.html',
  styleUrl: './year-grid.scss',
})
export class YearGrid {
  currentDate = input.required<Date>();
  selectedDate = input.required<Date>();

  readonly months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  monthSelection = output<Date>();

  isSelectedMonth(index: number): boolean {
    const currentViewYear = this.currentDate().getFullYear();
    const selectedYear = this.selectedDate().getFullYear();

    return index === this.selectedDate().getMonth() && currentViewYear === selectedYear;
  }

  isActualCurrentMonth(index: number): boolean {
    const today = new Date();
    return today.getMonth() === index && today.getFullYear() === this.currentDate().getFullYear();
  }

  selectMonth(index: number) {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(index);

    this.monthSelection.emit(newDate);
  }
}
