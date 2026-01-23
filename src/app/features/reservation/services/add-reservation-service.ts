import { inject, Injectable } from '@angular/core';
import { ReservationService } from '../../../core/services/reservation-service';
import { Reservation } from '../models/Reservation';
import { GuestService } from '../../../core/services/guest-service';
import { Guest } from '../models/Guest';
import { PropertyService } from '../../../core/services/property-service';

@Injectable({
  providedIn: 'root',
})
export class AddReservationService {
  private reservation = inject(ReservationService);
  private guest = inject(GuestService);
  private property = inject(PropertyService);

  guests = this.guest.guests;

  properties = this.property.properties;

  async addGuestAndReservation(reservation: Omit<Reservation, 'guestId'>, guest: Guest) {
    const guestId = await this.guest.addGuest(guest);

    const final_reservation: Reservation = {
      guestId,
      ...reservation,
    };

    await this.reservation.addReservation(final_reservation);
  }

  async addOnlyReservation(reservation: Reservation) {
    return await this.reservation.addReservation(reservation);
  }

  searchGuests(term: string): Guest[] {
    return this.guest.searchGuests(term);
  }
}
