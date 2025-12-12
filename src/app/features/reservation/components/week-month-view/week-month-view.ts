import { Component, computed, input } from '@angular/core';
import { CalendarDay, CalendarView } from '../../models/Calendar';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-week-month-view',
  imports: [MatIcon],
  templateUrl: './week-month-view.html',
  styleUrl: './week-month-view.scss',
})
export class WeekMonthView {
  readonly weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  view = input.required<CalendarView>();
  days = input.required<CalendarDay[]>();

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
}
