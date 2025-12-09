import { Reservation } from './Reservation';

export interface CalendarDay {
  date: Date | null;
  isToday: boolean;
  isPast: boolean;
  dayNumber: number;
  slots: DaySlot[];
}

export interface DaySlot {
  reservation: Reservation;
  type: 'start' | 'end' | 'stay' | 'single-day';
  timeLabel?: string;
}

export type CalendarView = 'year' | 'month' | 'week' | 'day';
