export interface SocialMedia {
  facebook?: string;
  instagram?: string;
}

export interface Property {
  id?: string;
  ownerIds: string[];

  createdAt: string;

  name: string;
  alias?: string;
  location: string;
  googleMapsAddress?: string;

  rooms: number;
  maxGuests: number;
  socialMedia?: SocialMedia;

  floor: number;
  blockName?: string;
}
