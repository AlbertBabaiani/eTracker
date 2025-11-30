import { Injectable, signal } from '@angular/core';
import { Reservation } from '../models/Reservation';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private _reservations = signal<Reservation[]>([
    {
      id: 'res_1',
      propertyId: 'prop_flat_1',
      guestId: 'John Doe',
      // Check-in: 5th at 14:00 (2 PM)
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5, 14, 0),
      // Check-out: 8th at 11:00 (11 AM)
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 8, 11, 0),
      price: 300,
      status: 'confirmed',
      color: '#e3f2fd', // Blue
    },
    {
      id: 'res_2',
      propertyId: 'prop_flat_1',
      guestId: 'Jane Smith',
      // Check-in: 8th at 15:00 (3 PM) - TURNOVER DAY
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 8, 15, 0),
      // Check-out: 12th at 10:00 (10 AM)
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 12, 10, 0),
      price: 600,
      status: 'confirmed',
      color: '#f3e5f5', // Purple
    },
    {
      id: 'res_3',
      propertyId: 'prop_flat_2',
      guestId: 'Jane Smith',
      // Check-in: 8th at 15:00 (3 PM) - TURNOVER DAY
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 8, 15, 0),
      // Check-out: 12th at 10:00 (10 AM)
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 12, 10, 0),
      price: 600,
      status: 'confirmed',
      color: '#f3e5f5', // Purple
    },
  ]);

  readonly reservations = this._reservations.asReadonly();

  getReservationsForDate(date: Date): Reservation[] {
    const checkStart = new Date(date);
    checkStart.setHours(0, 0, 0, 0);

    const checkEnd = new Date(date);
    checkEnd.setHours(23, 59, 59, 999);

    return this._reservations().filter((res) => {
      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);

      return resStart < checkEnd && resEnd > checkStart;
    });
  }

  getReservationType(date: Date, res: Reservation): 'start' | 'end' | 'stay' | 'single-day' {
    const d = new Date(date).setHours(0, 0, 0, 0);
    const start = new Date(res.startDate).setHours(0, 0, 0, 0);
    const end = new Date(res.endDate).setHours(0, 0, 0, 0);

    if (start === end) return 'single-day';
    if (d === start) return 'start';
    if (d === end) return 'end';
    return 'stay';
  }

  isStartDate(date: Date, reservation: Reservation): boolean {
    const checkDate = new Date(date).setHours(0, 0, 0, 0);
    const start = new Date(reservation.startDate).setHours(0, 0, 0, 0);
    return checkDate === start;
  }

  isEndDate(date: Date, reservation: Reservation): boolean {
    const checkDate = new Date(date).setHours(0, 0, 0, 0);
    const end = new Date(reservation.endDate).setHours(0, 0, 0, 0);
    return checkDate === end;
  }
}
