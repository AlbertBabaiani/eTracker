import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IUser, signUpFormData } from '../models/IUser';
import {
  applyActionCode,
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, Observable, of, switchMap } from 'rxjs';
import { LoadingService } from './loading-service';
import { Notification } from './notification';

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
  private loading = inject(LoadingService);
  private error = inject(Notification);

  private authUser$ = user(this.firebaseAuth);

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

  // Computed helper for guards
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

  async signup(form: signUpFormData) {
    try {
      this.loading.startProcess();
      const credential = await createUserWithEmailAndPassword(
        this.firebaseAuth,
        form.email,
        form.password
      );
      const uid = credential.user.uid;
      const locationData = await this.fetchLocationData();
      const userDoc = doc(this.fireStore, `users/${uid}`);

      const profile: any = {
        // Security
        uid: uid,
        ip: locationData.ip,
        lat: locationData.lat,
        long: locationData.long,
        location: locationData.location,
        createdAt: new Date().toISOString(),

        // Personal Information
        email: form.email,
        displayName: form.displayName,
        photoURL: '',
        phoneNumber: form.phoneNumber,
        emailVerified: false,
        properties: [],
      };

      await setDoc(userDoc, profile);

      if (this.firebaseAuth.currentUser) {
        await sendEmailVerification(this.firebaseAuth.currentUser);
      }
    } catch (error: any) {
    } finally {
      this.loading.stopProcess();
    }
  }

  async verifyEmail(code: string) {
    return applyActionCode(this.firebaseAuth, code);
  }

  async signin(email: string, pass: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.firebaseAuth, email, pass);

      if (!credential.user.emailVerified) {
        await signOut(this.firebaseAuth);
        throw new Error('auth/email-not-verified');
      }

      console.log('Logged In');
    } catch (error: any) {
      this.error.showError(error);
    }
  }

  async logout() {
    await signOut(this.firebaseAuth);
    this.router.navigate(['/login']);
    console.log('Signed Out');
  }

  async resetPassword(email: string): Promise<void> {
    throw new Error('Method not implemented yet.');
  }

  async updateProfile(data: Partial<IUser>): Promise<void> {
    const current = this.currentUser();
    if (!current) throw new Error('No user logged in');
    const userDoc = doc(this.fireStore, `users/${current.uid}`);
    await setDoc(userDoc, data, { merge: true });
  }
}
