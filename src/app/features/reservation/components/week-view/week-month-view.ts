import { Component, input } from '@angular/core';
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

  isLastWeek(index: number): boolean {
    const totalDays = this.days().length;
    if (totalDays === 0) return false;

    const rowCount = Math.ceil(totalDays / 7);

    const lastWeekStartIndex = (rowCount - 1) * 7;

    return index >= lastWeekStartIndex;
  }
}
