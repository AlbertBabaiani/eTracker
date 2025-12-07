import { Component, computed, inject, signal } from '@angular/core';
import { ReservationService } from '../../services/reservation-service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Reservation } from '../../models/Reservation';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { PropertyService } from '../../../../core/services/property-service';

interface CalendarDay {
  date: Date | null;
  isToday: boolean;
  isPast: boolean;
  dayNumber: number;
  slots: DaySlot[];
}

interface DaySlot {
  reservation: Reservation;
  type: 'start' | 'end' | 'stay' | 'single-day';
  timeLabel?: string;
}

type CalendarView = 'year' | 'month' | 'week' | 'day';

@Component({
  selector: 'app-calendar',
  imports: [
    NgClass,
    DatePipe,
    TitleCasePipe,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {
  private reservationService = inject(ReservationService);
  private propertyService = inject(PropertyService);

  view = signal<CalendarView>('month');
  currentDate = signal(new Date());
  selectedPropertyId = signal<string | null>(null);

  // Expose properties for the bottom panel
  properties = this.propertyService.properties;

  readonly weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
  hours = Array.from({ length: 24 }, (_, i) => i);

  currentLabel = computed(() => {
    const date = this.currentDate();
    if (this.view() === 'year') return date.getFullYear().toString();
    if (this.view() === 'day') return date.toLocaleString('default', { dateStyle: 'full' });
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  // --- FILTERING LOGIC ---

  private getFilteredReservations(date: Date): Reservation[] {
    const all = this.reservationService.getReservationsForDate(date);
    const filterId = this.selectedPropertyId();
    if (!filterId) return all;
    return all.filter((res) => res.propertyId === filterId);
  }

  // --- DATA GENERATION ---

  calendarDays = computed(() => {
    const view = this.view();
    if (view === 'year' || view === 'day') return [];

    const current = this.currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();

    let startDate: Date;
    let count: number;
    let padDays = 0;

    if (view === 'month') {
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      count = lastDayOfMonth.getDate();
      let startDay = firstDayOfMonth.getDay();
      padDays = startDay === 0 ? 6 : startDay - 1;
      startDate = firstDayOfMonth;
    } else {
      const dayOfWeek = current.getDay();
      const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      startDate = new Date(current);
      startDate.setDate(current.getDate() + diff);
      count = 7;
    }

    const days: CalendarDay[] = [];
    const todayTime = new Date().setHours(0, 0, 0, 0);

    for (let i = 0; i < padDays; i++) {
      days.push({ date: null, isToday: false, isPast: false, dayNumber: 0, slots: [] });
    }

    for (let i = 0; i < count; i++) {
      const date = new Date(startDate);
      if (view === 'month') date.setDate(i + 1);
      else date.setDate(startDate.getDate() + i);

      const checkTime = new Date(date).setHours(0, 0, 0, 0);

      // Use filtered reservations
      const reservations = this.getFilteredReservations(date);

      const slots: DaySlot[] = reservations.map((res) => {
        const type = this.reservationService.getReservationType(date, res);
        let timeLabel: string | undefined;
        if (type === 'start')
          timeLabel = new Date(res.startDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        else if (type === 'end')
          timeLabel = new Date(res.endDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        return { reservation: res, type, timeLabel };
      });

      // Sort: End -> Stay -> Start
      slots.sort((a, b) => {
        const order = { end: 1, stay: 2, start: 3, 'single-day': 4 };
        return order[a.type] - order[b.type];
      });

      days.push({
        date: date,
        dayNumber: date.getDate(),
        isToday: checkTime === todayTime,
        isPast: checkTime < todayTime,
        slots: slots,
      });
    }
    return days;
  });

  getCurrentDayReservations(): DaySlot[] {
    const date = this.currentDate();
    const reservations = this.getFilteredReservations(date);
    return reservations.map((res) => ({
      reservation: res,
      type: this.reservationService.getReservationType(date, res),
    }));
  }

  // --- NAVIGATION & SELECTION ---

  toggleProperty(id: string | null) {
    // If clicking same property, deselect (go back to All)
    if (this.selectedPropertyId() === id && id !== null) {
      this.selectedPropertyId.set(null);
    } else {
      this.selectedPropertyId.set(id);
    }
  }

  navigate(delta: number) {
    const view = this.view();
    const newDate = new Date(this.currentDate());
    if (view === 'year') newDate.setFullYear(newDate.getFullYear() + delta);
    else if (view === 'month') newDate.setMonth(newDate.getMonth() + delta);
    else if (view === 'week') newDate.setDate(newDate.getDate() + delta * 7);
    else if (view === 'day') newDate.setDate(newDate.getDate() + delta);
    this.currentDate.set(newDate);
  }

  goToToday() {
    this.currentDate.set(new Date());
  }

  // --- YEAR VIEW HIGHLIGHT LOGIC ---

  // Is this month selected in the view? (e.g. "Nov 2025" when viewed)
  isSelectedMonth(index: number): boolean {
    return this.currentDate().getMonth() === index;
  }

  // Is this the ACTUAL current month? (e.g. Today is Nov, highlight Nov)
  isActualCurrentMonth(index: number): boolean {
    const today = new Date();
    return today.getMonth() === index && today.getFullYear() === this.currentDate().getFullYear();
  }

  selectMonth(index: number) {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(index);
    this.currentDate.set(newDate);
    this.view.set('month');
  }

  onDayClick(day: CalendarDay) {
    if (!day.date) return;
    this.currentDate.set(day.date);
    this.view.set('day');
  }

  // --- HELPERS ---
  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }
  calculateTop(res: Reservation): number {
    /* Same as before */
    const current = this.currentDate();
    const start = new Date(res.startDate);
    if (start.getDate() !== current.getDate() || start.getMonth() !== current.getMonth()) return 0;
    return ((start.getHours() * 60 + start.getMinutes()) / 1440) * 100;
  }
  calculateHeight(res: Reservation): number {
    /* Same as before */
    const current = this.currentDate();
    const start = new Date(res.startDate);
    const end = new Date(res.endDate);
    let s = 0,
      e = 1440;
    if (start.getDate() === current.getDate()) s = start.getHours() * 60 + start.getMinutes();
    if (end.getDate() === current.getDate()) e = end.getHours() * 60 + end.getMinutes();
    return ((e - s) / 1440) * 100;
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
  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
