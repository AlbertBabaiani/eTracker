import { Component, computed, input, output } from '@angular/core';
import { AddBtn } from '../../../../shared/components/add-btn/add-btn';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-year-view',
  imports: [AddBtn, TranslocoDirective],
  templateUrl: './year-view.html',
  styleUrl: './year-view.scss',
})
export class YearView {
  currentDate = input.required<Date>();
  selectedDate = input.required<Date>();

  monthSelection = output<Date>();

  readonly months = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];

  private viewYear = computed(() => this.currentDate().getFullYear());
  private selYear = computed(() => this.selectedDate().getFullYear());
  private selMonth = computed(() => this.selectedDate().getMonth());

  private currentRealYear = new Date().getFullYear();
  private currentRealMonth = new Date().getMonth();

  isSelectedMonth(index: number): boolean {
    return index === this.selMonth() && this.viewYear() === this.selYear();
  }

  isActualCurrentMonth(index: number): boolean {
    return index === this.currentRealMonth && this.viewYear() === this.currentRealYear;
  }

  selectMonth(index: number) {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(index);

    this.monthSelection.emit(newDate);
  }
}
