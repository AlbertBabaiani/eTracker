import { DatePipe } from '@angular/common';
import { Component, input, OnDestroy, signal } from '@angular/core';
import { Reservation } from '../../models/Reservation';
import { DaySlot } from '../../models/Calendar';

@Component({
  selector: 'app-day-view',
  imports: [DatePipe],
  templateUrl: './day-view.html',
  styleUrl: './day-view.scss',
})
export class DayView implements OnDestroy {
  currentDate = input.required<Date>();
  reservations = input.required<DaySlot[]>();

  now = signal<Date>(new Date());
  private timeInterval: any;

  readonly hours = Array.from({ length: 24 }, (_, i) => i);

  constructor() {
    this.timeInterval = setInterval(() => {
      this.now.set(new Date());
    }, 5000);
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  getReservationStatusClasses(res: Reservation) {
    const currentDay = new Date(this.currentDate()).setHours(0, 0, 0, 0);
    const startDay = new Date(res.startDate).setHours(0, 0, 0, 0);
    const endDay = new Date(res.endDate).setHours(0, 0, 0, 0);

    return {
      'starts-today': startDay === currentDay,
      'ends-today': endDay === currentDay,
      'continues-from-prev': startDay < currentDay,
      'continues-to-next': endDay > currentDay,
    };
  }

  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  calculateTop(res: Reservation): number {
    const current = this.currentDate();
    const start = new Date(res.startDate);
    if (start.getDate() !== current.getDate() || start.getMonth() !== current.getMonth()) return 0;
    return ((start.getHours() * 60 + start.getMinutes()) / 1440) * 100;
  }

  calculateHeight(res: Reservation): number {
    const current = this.currentDate();
    const start = new Date(res.startDate);
    const end = new Date(res.endDate);

    let startTime = 0;
    let endTime = 1440;

    if (start.getDate() === current.getDate()) {
      startTime = start.getHours() * 60 + start.getMinutes();
    }
    if (end.getDate() === current.getDate()) {
      endTime = end.getHours() * 60 + end.getMinutes();
    }

    return ((endTime - startTime) / 1440) * 100;
  }

  calculateCurrentTimeTop(): number {
    const now = new Date();
    return ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
}
