import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IUser } from '../models/IUser';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, Observable, of, switchMap } from 'rxjs';

interface IpApiResponse {
  ip: string;
  city: string;
  country_name: string;
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private firebaseAuth = inject(Auth);
  private fireStore = inject(Firestore);
  private router = inject(Router);

  private authUser$ = user(this.firebaseAuth);

  // Signal that holds the full DB profile (User interface)
  currentUser = toSignal(
    this.authUser$.pipe(
      switchMap((fUser) => {
        if (!fUser) return of(null);

        const userDoc = doc(this.fireStore, `users/${fUser.uid}`);

        return (docData(userDoc) as Observable<IUser>).pipe(
          catchError((err) => {
            console.error('Database Error:', err);
            return of(null);
          })
        );
      })
    )
  );

  isAuthenticated = () => !!this.currentUser();

  private async fetchLocationData() {
    try {
      const data = await firstValueFrom(this.http.get<IpApiResponse>('https://ipapi.co/json/'));
      return {
        ip: data.ip,
        lat: data.latitude.toString(),
        long: data.longitude.toString(),
        location: `${data.city}, ${data.country_name}`,
      };
    } catch (error) {
      console.warn('Location API failed or blocked:', error);
      return {
        ip: 'Unknown',
        lat: '0',
        long: '0',
        location: 'Unknown',
      };
    }
  }

  async signUp(email: string, pass: string, displayName: string) {
    try {
      // 1. Create Auth User
      const credential = await createUserWithEmailAndPassword(this.firebaseAuth, email, pass);
      const uid = credential.user.uid;

      // 2. Fetch Metadata
      const locationData = await this.fetchLocationData();

      // 3. Create Firestore Profile
      const userDoc = doc(this.fireStore, `users/${uid}`);

      const profile: IUser = {
        uid: uid,
        email: email,
        displayName: displayName,
        photoURL: '',
        phoneNumber: '',
        createdAt: new Date().toISOString(),
        properties: [],
        // Location Data
        ip: locationData.ip,
        lat: locationData.lat,
        long: locationData.long,
        location: locationData.location,
      };

      await setDoc(userDoc, profile);
      this.router.navigate(['/dashboard']);
      console.log('User created and profile saved');
    } catch (error: any) {
      console.error('Sign Up Error:', error);
      throw error; // Re-throw so components can handle UI feedback
    }
  }

  async signin(email: string, pass: string) {
    try {
      await signInWithEmailAndPassword(this.firebaseAuth, email, pass);
      console.log('Logged In');
    } catch (error: any) {
      console.error('Sign In Error:', error);
      throw error;
    }
  }

  async logout() {
    await signOut(this.firebaseAuth);
    this.router.navigate(['/login']);
    console.log('Signed Out');
  }

  async resetPassword(email: string): Promise<void> {
    // Note: requires sendPasswordResetEmail import from @angular/fire/auth
    throw new Error('Method not implemented yet.');
  }

  async updateProfile(data: Partial<IUser>): Promise<void> {
    const current = this.currentUser();
    if (!current) throw new Error('No user logged in');

    const userDoc = doc(this.fireStore, `users/${current.uid}`);
    // Merge update
    await setDoc(userDoc, data, { merge: true });
  }
}
