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
import { of, switchMap } from 'rxjs';
import { IUser } from '../../shared/models/IUser';
import { LoadingService } from './loading-service';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private loading = inject(LoadingService);

  properties = toSignal(
    toObservable(this.authService.currentUser).pipe(
      switchMap((user) => {
        if (!user) {
          return of([] as Property[]);
        }

        const propertiesCollection = collection(this.firestore, 'properties');

        // Query: Select properties where the 'ownerIds' array contains the current user's UID
        const q = query(propertiesCollection, where('ownerIds', 'array-contains', user.uid));

        // Return a real-time stream of data
        // { idField: 'id' } maps the Firestore document ID to the 'id' property of the object
        return collectionData(q, { idField: 'id' });
      })
    ),
    { initialValue: [] }
  );

  getPropertyById(id: string): any {
    return this.properties().find((p) => p.id === id);
  }

  /**
   * Adds a new property to Firestore.
   * Automatically adds the currently logged-in user to the 'ownerIds' list.
   */
  async addProperty(newProperty: Property): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      throw new Error('You must be logged in to add a property.');
    }

    const propertiesCollection = collection(this.firestore, 'properties');

    // Ensure the current user is an owner
    let owners = newProperty.ownerIds || [];
    if (!owners.includes(user.uid)) {
      owners = [...owners, user.uid];
    }

    // Remove the 'id' field if it exists (Firestore generates a new unique ID)
    const { id, ...dataToSave } = newProperty;

    // Sanitize data: Firestore throws an error if fields are 'undefined'.
    // JSON.parse/stringify is a quick way to strip undefined fields.
    const sanitizedData = JSON.parse(JSON.stringify(dataToSave));

    // Create the document
    await addDoc(propertiesCollection, {
      ...sanitizedData,
      ownerIds: owners,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Updates an existing property document in Firestore.
   */
  async updateProperty(updatedProperty: Property): Promise<void> {
    if (!updatedProperty.id) {
      throw new Error('Property ID is required for updates.');
    }

    const docRef = doc(this.firestore, `properties/${updatedProperty.id}`);

    // Separate the ID from the data payload
    const { id, ...data } = updatedProperty;

    // Sanitize data to remove undefined values
    const sanitizedData = JSON.parse(JSON.stringify(data));

    await updateDoc(docRef, sanitizedData);
  }

  /**
   * Searches for users in Firestore by their display name.
   * Used for the "Add Owner" autocomplete functionality.
   */
  async searchUsers(term: string): Promise<IUser[]> {
    if (!term) return [];

    const usersCollection = collection(this.firestore, 'users');

    // Perform a prefix search on the 'displayName' field
    // Note: Firestore string matching is case-sensitive by default.
    const q = query(
      usersCollection,
      where('displayName', '>=', term),
      where('displayName', '<=', term + '\uf8ff')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as IUser);
  }
}
