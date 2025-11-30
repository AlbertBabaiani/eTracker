export interface Reservation {
  id: string;
  propertyId: string;
  guestId: string;
  startDate: Date;
  endDate: Date;
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  color?: string;
}
