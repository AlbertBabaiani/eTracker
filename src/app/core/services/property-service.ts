import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth-service';
import { Property } from '../../shared/models/Property';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap } from 'rxjs';
import { IUser } from '../../shared/models/IUser';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  properties = toSignal(
    toObservable(this.auth.currentUser).pipe(
      switchMap((user) => {
        if (!user) {
          return of([] as Property[]);
        }

        const propertiesCollection = collection(this.firestore, 'properties');

        const q = query(propertiesCollection, where('ownerIds', 'array-contains', user.uid));

        return collectionData(q, { idField: 'id' }) as Observable<Property[]>;
      }),
    ),
    { initialValue: [] },
  );

  getPropertyById(id: string): any {
    return this.properties().find((p) => p.id === id);
  }

  async addProperty(newProperty: Property): Promise<void> {
    const user = this.auth.currentUser();

    if (!user) {
      // TODO
      throw new Error('You must be logged in to add a property.');
    }

    const propertiesCollection = collection(this.firestore, 'properties');

    // Ensure the current user is an owner
    let owners = newProperty.ownerIds || [];
    if (!owners.includes(user.uid!)) {
      owners = [...owners, user.uid!];
    }

    const { id, ...dataToSave } = newProperty;

    const sanitizedData = JSON.parse(JSON.stringify(dataToSave));

    await addDoc(propertiesCollection, {
      ...sanitizedData,
      ownerIds: owners,
      createdAt: new Date().toISOString(),
    });
  }

  async updateProperty(updatedProperty: Property): Promise<void> {
    if (!updatedProperty.id) {
      throw new Error('Property ID is required for updates.');
    }

    const docRef = doc(this.firestore, `properties/${updatedProperty.id}`);

    const { id, ...data } = updatedProperty;

    const sanitizedData = JSON.parse(JSON.stringify(data));

    await updateDoc(docRef, sanitizedData);
  }

  async searchUsers(term: string): Promise<IUser[]> {
    if (!term) return [];

    const usersCollection = collection(this.firestore, 'users');

    // Perform a prefix search on the 'displayName' field
    // Note: Firestore string matching is case-sensitive by default.
    const q = query(
      usersCollection,
      where('displayName', '>=', term),
      where('displayName', '<=', term + '\uf8ff'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as IUser);
  }

  getPropertyColorById(id: string) {
    return (this.properties().filter((p) => p.id === id) || [])[0].color ?? '#e2e8f0';
  }
}
