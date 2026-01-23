import { Component, computed, inject, signal } from '@angular/core';
import { ReservationService } from '../../../../core/services/reservation-service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Reservation } from '../../models/Reservation';
import { PropertyService } from '../../../../core/services/property-service';
import { MatDialog } from '@angular/material/dialog';
import { AddReservation } from '../add-reservation/add-reservation';
import { CalendarControls } from '../calendar-controls/calendar-controls';
import { CalendarDay, CalendarView, DaySlot } from '../../models/Calendar';
import { YearView } from '../year-view/year-view';
import { DayView } from '../day-view/day-view';
import { WeekMonthView } from '../week-month-view/week-month-view';
import { PropertySelection } from '../property-selection/property-selection';

@Component({
  selector: 'app-calendar',
  imports: [
    CalendarControls,
    YearView,
    DayView,
    WeekMonthView,
    PropertySelection,
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
  private dialog = inject(MatDialog);

  view = signal<CalendarView>('month');
  currentDate = signal(new Date());
  selectedDate = signal(new Date());
  selectedPropertyId = signal<string | null>(null);

  properties = this.propertyService.properties;

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

  // --- NAVIGATION & SELECTION START ---

  navigate(delta: number) {
    const view = this.view();
    const newDate = new Date(this.currentDate());
    if (view === 'year') newDate.setFullYear(newDate.getFullYear() + delta);
    else if (view === 'month') newDate.setMonth(newDate.getMonth() + delta);
    else if (view === 'week') newDate.setDate(newDate.getDate() + delta * 7);
    else if (view === 'day') newDate.setDate(newDate.getDate() + delta);
    this.currentDate.set(newDate);
    this.selectedDate.set(newDate);
  }

  goToToday() {
    this.currentDate.set(new Date());
    this.selectedDate.set(new Date());
  }

  // --- NAVIGATION & SELECTION END ---

  onDayClick(day: Date) {
    if (!day) return;
    this.currentDate.set(day);
    this.view.set('day');
  }

  monthSelection(selectedDate: Date): void {
    this.currentDate.set(selectedDate);
    this.selectedDate.set(selectedDate);
    this.view.set('month');
  }

  // --- ADD RESERVATION START

  openAddReservation() {
    this.dialog.open(AddReservation, {
      width: '500px',
      // Pass data if needed, e.g. pre-selected date
    });
  }
}
