export interface Reservation {
  id?: string;
  propertyId: string;
  guestId: string;

  startDate: Date;
  endDate: Date;

  bePrice: number;
  dayPrice: number;
  totalPrice: number;

  days: number;
}
