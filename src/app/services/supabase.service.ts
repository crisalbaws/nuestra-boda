import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Guest } from '../models/guest.model';
import { Wedding } from '../models/wedding.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  // ==================== GUEST OPERATIONS ====================

  async getGuests(): Promise<Guest[]> {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching guests:', error);
      return [];
    }

    return data.map(this.mapGuestFromDb);
  }

  async getGuestById(id: string): Promise<Guest | null> {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching guest:', error);
      return null;
    }

    return this.mapGuestFromDb(data);
  }

  async getGuestByEncryptedId(encryptedId: string): Promise<Guest | null> {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .eq('encrypted_id', encryptedId)
      .single();

    if (error) {
      console.error('Error fetching guest by encrypted ID:', error);
      return null;
    }

    return this.mapGuestFromDb(data);
  }

  async getGuestByPhone(phone: string): Promise<Guest | null> {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      console.error('Error fetching guest by phone:', error);
      return null;
    }

    return this.mapGuestFromDb(data);
  }

  async addGuest(guestData: { name: string; nickname?: string; phone: string; plusOnesAdults: number; plusOnesKids: number }): Promise<Guest | null> {
    const encryptedId = this.encryptPhone(guestData.phone);
    
    const { data, error } = await this.supabase
      .from('guests')
      .insert({
        name: guestData.name,
        nickname: guestData.nickname || null,
        phone: guestData.phone,
        encrypted_id: encryptedId,
        confirmed: false,
        plus_ones_adults: guestData.plusOnesAdults,
        plus_ones_kids: guestData.plusOnesKids,
        dietary_restrictions: null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding guest:', error);
      return null;
    }

    return this.mapGuestFromDb(data);
  }

  async updateGuest(id: string, updates: Partial<Guest>): Promise<boolean> {
    const dbUpdates: any = {};
    
    if (updates.confirmed !== undefined) dbUpdates.confirmed = updates.confirmed;
    if (updates.plusOnesAdults !== undefined) dbUpdates.plus_ones_adults = updates.plusOnesAdults;
    if (updates.plusOnesKids !== undefined) dbUpdates.plus_ones_kids = updates.plusOnesKids;
    if (updates.dietaryRestrictions !== undefined) dbUpdates.dietary_restrictions = updates.dietaryRestrictions;

    const { error } = await this.supabase
      .from('guests')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating guest:', error);
      return false;
    }

    return true;
  }

  async deleteGuest(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('guests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting guest:', error);
      return false;
    }

    return true;
  }

  async getConfirmedCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('confirmed', true);

    if (error) {
      console.error('Error getting confirmed count:', error);
      return 0;
    }

    return count || 0;
  }

  async getDeclinedCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('confirmed', false)
      .eq('dietary_restrictions', 'declined');

    if (error) {
      console.error('Error getting declined count:', error);
      return 0;
    }

    return count || 0;
  }

  async getPendingCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('confirmed', false)
      .neq('dietary_restrictions', 'declined');

    if (error) {
      console.error('Error getting pending count:', error);
      return 0;
    }

    return count || 0;
  }

  async getTotalAttendees(): Promise<number> {
    const guests = await this.getGuests();
    return guests
      .filter(g => g.confirmed)
      .reduce((sum, g) => sum + 1 + g.plusOnesAdults + g.plusOnesKids, 0);
  }

  // ==================== WEDDING OPERATIONS ====================

  async getWedding(): Promise<Wedding | null> {
    const { data, error } = await this.supabase
      .from('wedding')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching wedding:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return this.mapWeddingFromDb(data[0]);
  }

  async saveWedding(wedding: Wedding): Promise<boolean> {
    const { error } = await this.supabase
      .from('wedding')
      .insert({
        id: wedding.id || this.generateId(),
        partner1_name: wedding.partner1Name,
        partner2_name: wedding.partner2Name,
        date: wedding.date || null,
        temple_location: wedding.templeLocation || null,
        temple_time: wedding.templeTime || null,
        party_location: wedding.partyLocation || null,
        party_time: wedding.partyTime || null,
        temple_map_url: wedding.templeMapUrl || null,
        party_map_url: wedding.partyMapUrl || null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving wedding:', error);
      return false;
    }

    return true;
  }

  async updateWedding(wedding: Wedding): Promise<boolean> {
    const { error } = await this.supabase
      .from('wedding')
      .update({
        partner1_name: wedding.partner1Name,
        partner2_name: wedding.partner2Name,
        date: wedding.date || null,
        temple_location: wedding.templeLocation || null,
        temple_time: wedding.templeTime || null,
        party_location: wedding.partyLocation || null,
        party_time: wedding.partyTime || null,
        temple_map_url: wedding.templeMapUrl || null,
        party_map_url: wedding.partyMapUrl || null
      })
      .eq('id', wedding.id);

    if (error) {
      console.error('Error updating wedding:', error);
      return false;
    }

    return true;
  }

  // ==================== UTILITY METHODS ====================

  generateInvitationLink(guest: Guest): string {
    return `${window.location.origin}${window.location.pathname}#/confirm/${guest.encryptedId}`;
  }

  encryptPhone(phone: string): string {
    const key = 'boda2024';
    let result = '';
    for (let i = 0; i < phone.length; i++) {
      const charCode = phone.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += charCode.toString(16).padStart(2, '0');
    }
    return btoa(result);
  }

  private mapGuestFromDb(data: any): Guest {
    return {
      id: data.id,
      name: data.name,
      nickname: data.nickname || undefined,
      phone: data.phone,
      encryptedId: data.encrypted_id,
      confirmed: data.confirmed,
      plusOnesAdults: data.plus_ones_adults || 0,
      plusOnesKids: data.plus_ones_kids || 0,
      dietaryRestrictions: data.dietary_restrictions,
      createdAt: new Date(data.created_at)
    };
  }

  private mapWeddingFromDb(data: any): Wedding {
    return {
      id: data.id,
      partner1Name: data.partner1_name,
      partner2Name: data.partner2_name,
      date: data.date,
      templeLocation: data.temple_location,
      templeTime: data.temple_time,
      partyLocation: data.party_location,
      partyTime: data.party_time,
      templeMapUrl: data.temple_map_url,
      partyMapUrl: data.party_map_url
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
