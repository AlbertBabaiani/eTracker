import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IUser, signUpFormData } from '../../shared/models/IUser';
import {
  applyActionCode,
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import {
  collection,
  doc,
  docData,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
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
  private notification = inject(Notification);

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

      const usersRef = collection(this.fireStore, 'users');
      const q = query(usersRef, where('email', '==', form.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const error: any = new Error('Email already in use');
        error.code = 'auth/email-already-in-use';
        this.notification.handleAuthError(error);
        throw error;
      }

      const credential = await createUserWithEmailAndPassword(
        this.firebaseAuth,
        form.email,
        form.password
      );
      const uid = credential.user.uid;
      const locationData = await this.fetchLocationData();
      const userDoc = doc(this.fireStore, `users/${uid}`);

      function firstLetterToUpperCase(_word: string): string {
        const word = _word.split(' ');
        return word.map((n) => n[0].toUpperCase() + n.slice(1)).join(' ');
      }

      const profile: IUser = {
        // Security
        uid: uid,
        ip: locationData.ip,
        lat: locationData.lat,
        long: locationData.long,
        location: locationData.location,
        createdAt: new Date().toISOString(),

        // Personal Information
        email: form.email,
        firstName: firstLetterToUpperCase(form.firstName),
        lastName: firstLetterToUpperCase(form.lastName),
        displayName: firstLetterToUpperCase(form.displayName),
        photoURL: '',
        phone: form.phone,
        properties: [],
      };

      await setDoc(userDoc, profile);

      if (this.firebaseAuth.currentUser) {
        await sendEmailVerification(this.firebaseAuth.currentUser);
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.notification.showError('AUTH.TOAST.EMAIL_IN_USE');
      } else {
        this.notification.handleAuthError(error);
      }

      throw error;
    } finally {
      this.loading.stopProcess();
    }
  }

  async verifyEmail(code: string) {
    return applyActionCode(this.firebaseAuth, code);
  }

  async signin(email: string, pass: string): Promise<boolean> {
    try {
      this.loading.startProcess();
      const credential = await signInWithEmailAndPassword(this.firebaseAuth, email, pass);

      // 1. Check Email Verification
      if (!credential.user.emailVerified) {
        await signOut(this.firebaseAuth);
        this.notification.showError('AUTH.TOAST.EMAIL_NOT_VERIFIED');
        return false;
      }

      // 2. Get User Name for Welcome Message
      const userDocRef = doc(this.fireStore, `users/${credential.user.uid}`);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data() as IUser;
      const name = userData?.firstName || email.split('@')[0];

      this.notification.showSuccess('AUTH.TOAST.WELCOME_BACK', { name });
      this.router.navigate(['/dashboard']);
      return true;
    } catch (error: any) {
      this.notification.handleAuthError(error);
      return false;
    } finally {
      this.loading.stopProcess();
    }
  }

  async logout() {
    await signOut(this.firebaseAuth);
    this.router.navigate(['/login']);
  }

  async resetPassword(email: string): Promise<void> {
    try {
      this.loading.startProcess();
      await sendPasswordResetEmail(this.firebaseAuth, email);
      this.notification.showSuccess('AUTH.TOAST.RESET_SENT');
      this.router.navigate(['/signin']);
    } catch (error: any) {
      this.notification.showError('AUTH.TOAST.ERROR_RESET');
      throw error;
    } finally {
      this.loading.stopProcess();
    }
  }

  async updateProfile(data: Partial<IUser>): Promise<void> {
    const current = this.currentUser();
    if (!current) throw new Error('No user logged in');
    const userDoc = doc(this.fireStore, `users/${current.uid}`);
    await setDoc(userDoc, data, { merge: true });
  }
}
