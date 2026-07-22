import { Injectable } from '@angular/core';
import { Guest } from '../models/guest.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  constructor(private supabaseService: SupabaseService) {}

  async getGuests(): Promise<Guest[]> {
    return this.supabaseService.getGuests();
  }

  async getGuestByEncryptedId(encryptedId: string): Promise<Guest | null> {
    return this.supabaseService.getGuestByEncryptedId(encryptedId);
  }

  async addGuest(guestData: { name: string; nickname?: string; phone: string; plusOnesAdults: number; plusOnesKids: number }): Promise<Guest | null> {
    return this.supabaseService.addGuest(guestData);
  }

  async updateGuest(id: string, updates: Partial<Guest>): Promise<boolean> {
    return this.supabaseService.updateGuest(id, updates);
  }

  async deleteGuest(id: string): Promise<boolean> {
    return this.supabaseService.deleteGuest(id);
  }

  async getConfirmedCount(): Promise<number> {
    return this.supabaseService.getConfirmedCount();
  }

  async getDeclinedCount(): Promise<number> {
    return this.supabaseService.getDeclinedCount();
  }

  async getPendingCount(): Promise<number> {
    return this.supabaseService.getPendingCount();
  }

  async getTotalAttendees(): Promise<number> {
    return this.supabaseService.getTotalAttendees();
  }

  generateInvitationLink(guest: Guest): string {
    return this.supabaseService.generateInvitationLink(guest);
  }
}
