export interface Guest {
  id: string;
  name: string;
  nickname?: string;
  phone: string;
  encryptedId: string;
  confirmed: boolean;
  plusOnesAdults: number;
  plusOnesKids: number;
  dietaryRestrictions?: string;
  createdAt: Date;
}
