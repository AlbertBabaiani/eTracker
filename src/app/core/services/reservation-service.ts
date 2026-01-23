import { inject, Injectable } from '@angular/core';
import { Reservation } from '../../features/reservation/models/Reservation';
import { addDoc, collection, collectionData, Firestore } from '@angular/fire/firestore';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, map, of, switchMap } from 'rxjs';
import { PropertyService } from './property-service';
import { LoadingService } from './loading-service';
import { Notification } from './notification';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private firestore = inject(Firestore);
  private propertyService = inject(PropertyService);
  private loading = inject(LoadingService);
  private notification = inject(Notification);

  reservations = toSignal(
    toObservable(this.propertyService.properties).pipe(
      switchMap((properties) => {
        if (!properties || properties.length === 0) {
          return of([] as Reservation[]);
        }

        const myPropertyIds = new Set(properties.map((p) => p.id));

        const reservationsCollection = collection(this.firestore, 'reservations');

        return collectionData(reservationsCollection, { idField: 'id' }).pipe(
          map((docs: any[]) => {
            return docs
              .map(
                (data) =>
                  ({
                    ...data,
                    startDate: data.startDate?.toDate
                      ? data.startDate.toDate()
                      : new Date(data.startDate),
                    endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate),
                  }) as Reservation,
              )
              .filter((res) => res.propertyId && myPropertyIds.has(res.propertyId));
          }),
        );
      }),
    ),
    { initialValue: [] },
  );

  getReservationsForDate(date: Date): Reservation[] {
    const checkStart = new Date(date);
    checkStart.setHours(0, 0, 0, 0);

    const checkEnd = new Date(date);
    checkEnd.setHours(23, 59, 59, 999);

    return this.reservations().filter((res) => {
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

  private hasOverlap(newRes: Reservation): boolean {
    const newStart = newRes.startDate.getTime();
    const newEnd = newRes.endDate.getTime();

    const existingReservations = this.reservations().filter(
      (r) => r.propertyId === newRes.propertyId,
    );

    return existingReservations.some((r) => {
      const existingStart = r.startDate.getTime();
      const existingEnd = r.endDate.getTime();

      return newStart < existingEnd && newEnd > existingStart;
    });
  }

  async addReservation(reservation: Reservation) {
    try {
      this.loading.startProcess();

      if (this.hasOverlap(reservation)) {
        this.notification.showError('RESERVATION.TOAST.OVERLAP');
        return null;
      }

      const sanitizedData = JSON.parse(JSON.stringify(reservation));

      const reservationsCollection = collection(this.firestore, 'reservations');

      const response = await addDoc(reservationsCollection, sanitizedData);

      return response.id;
    } catch (err: any) {
      this.notification.showError();
      return null;
    } finally {
      this.loading.stopProcess();
    }
  }
}
