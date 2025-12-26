import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
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
    { initialValue: [] }
  );

  async searchGuests(term: string): Promise<Guest[]> {
    const guestsRef = collection(this.firestore, 'guests');

    const q = query(
      guestsRef,
      where('firstName', '>=', term),
      where('firstName', '<=', term + '\uf8ff')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Guest));
  }

  async addGuest(guest: Guest): Promise<any> {
    this.loading.startProcess();

    try {
      const guestsRef = collection(this.firestore, 'guests');

      const sanitizedData = JSON.parse(JSON.stringify(guest));

      const docRef = await addDoc(guestsRef, sanitizedData);
      return docRef.id;
    } catch (err) {
      this.notification.showError();
      return EMPTY;
    } finally {
      this.loading.stopProcess();
    }
  }
}
