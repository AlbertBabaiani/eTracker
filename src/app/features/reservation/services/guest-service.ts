import { inject, Injectable } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { Guest } from '../models/Guest';

@Injectable({
  providedIn: 'root',
})
export class GuestService {
  private firestore = inject(Firestore);

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

  async addGuest(guest: Omit<Guest, 'id'>): Promise<string> {
    const guestsRef = collection(this.firestore, 'guests');
    const docRef = await addDoc(guestsRef, guest);
    return docRef.id;
  }
}
