import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, Firestore, getDocs } from '@angular/fire/firestore';
import { Guest } from '../../features/reservation/models/Guest';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, Observable } from 'rxjs';
import { Notification } from './notification';
import { LoadingService } from './loading-service';

@Injectable({
  providedIn: 'root',
})
export class GuestService {
  private firestore = inject(Firestore);
  private notification = inject(Notification);
  private loading = inject(LoadingService);

  guests = toSignal(
    collectionData(collection(this.firestore, 'guests'), { idField: 'id' }) as Observable<Guest[]>,
    { initialValue: [] },
  );

  searchGuests(term: string): Guest[] {
    const lowerTerm = term.toLowerCase().trim();

    if (!lowerTerm) return [] as Guest[];

    return this.guests().filter((guest) => {
      const fn = guest.firstName?.toLowerCase().includes(lowerTerm);
      const ls = guest.lastName?.toLowerCase().includes(lowerTerm);
      const pn = guest.phone?.toLowerCase().includes(lowerTerm);

      return fn || ls || pn;
    });
  }

  async addGuest(guest: Guest): Promise<any> {
    this.loading.startProcess();

    try {
      const guestsRef = collection(this.firestore, 'guests');

      const sanitizedData = JSON.parse(JSON.stringify(guest)) as Guest;

      const response = await addDoc(guestsRef, sanitizedData);
      return response.id;
    } catch (err) {
      this.notification.showError();
      return EMPTY;
    } finally {
      this.loading.stopProcess();
    }
  }

  getGuestNameById(id: string) {
    return (this.guests().filter((guest) => guest.id === id) || [])[0];
  }
}
