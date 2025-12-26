import { Component, computed, HostListener, input, output, signal } from '@angular/core';
import { CalendarDay, CalendarView } from '../../models/Calendar';
import { MatIcon } from '@angular/material/icon';
import { TitleCasePipe } from '@angular/common';
import { InitialsPipe } from '../../../../shared/pipes/initials-pipe';
import { MatButtonModule } from '@angular/material/button';
import { AddBtn } from '../../../../shared/components/add-btn/add-btn';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-week-month-view',
  imports: [MatIcon, MatButtonModule, TitleCasePipe, InitialsPipe, AddBtn, TranslocoDirective],
  templateUrl: './week-month-view.html',
  styleUrl: './week-month-view.scss',
})
export class WeekMonthView {
  readonly weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  view = input.required<CalendarView>();
  days = input.required<CalendarDay[]>();

  viewDate = output<Date>();
  startReservation = output<Date | null>();

  activeDate = signal<number | null>(null);

  lastDay = computed(() => this.days()[this.days().length - 1].date);

  nextMonthPadding = computed(() => {
    const allDays = this.days();
    if (allDays.length === 0) return [];

    const lastDay = allDays[allDays.length - 1];
    if (!lastDay.date) return [];

    const dayOfWeek = lastDay.date.getDay();

    if (dayOfWeek === 0) return [];

    const missingDaysCount = 7 - dayOfWeek;

    return Array.from({ length: missingDaysCount }, (_, i) => i + 1);
  });

  isFirstRow(index: number): boolean {
    return index >= 0 && index <= 6 && this.days().length !== 7;
  }

  isLastWeek(index: number): boolean {
    const totalDays = this.days().length;
    if (totalDays === 0) return false;
    const rowCount = Math.ceil(totalDays / 7);
    const lastWeekStartIndex = (rowCount - 1) * 7;
    return index >= lastWeekStartIndex;
  }

  selectDate(index: number, event: MouseEvent): void {
    event.stopPropagation();

    if (this.activeDate() === index) {
      this.activeDate.set(null);
    } else {
      this.activeDate.set(index);
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.activeDate.set(null);
  }

  triggerView(date: Date, event: Event): void {
    event.stopPropagation();

    this.viewDate.emit(date);
  }

  triggerAddReservation(event: Event, date?: Date): void {
    event.stopPropagation();

    this.startReservation.emit(date ?? null);
  }
}
