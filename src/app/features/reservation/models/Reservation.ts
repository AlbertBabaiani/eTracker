export interface Reservation {
  id: string;
  propertyId: string;
  guestId: string;
  startDate: Date;
  endDate: Date;
  price: number;
  bePrice?: number;
  status: 'confirmed' | 'pending';
}
