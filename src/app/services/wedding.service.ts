import { Injectable } from '@angular/core';
import { Wedding } from '../models/wedding.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class WeddingService {
  private cachedWedding: Wedding | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async getWedding(): Promise<Wedding | null> {
    if (this.cachedWedding) {
      return this.cachedWedding;
    }
    
    const wedding = await this.supabaseService.getWedding();
    if (wedding) {
      this.cachedWedding = wedding;
    }
    return wedding;
  }

  async saveWedding(wedding: Wedding): Promise<boolean> {
    const success = await this.supabaseService.saveWedding(wedding);
    if (success) {
      this.cachedWedding = wedding;
    }
    return success;
  }

  async updateWedding(wedding: Wedding): Promise<boolean> {
    const success = await this.supabaseService.updateWedding(wedding);
    if (success) {
      this.cachedWedding = wedding;
    }
    return success;
  }

  clearCache(): void {
    this.cachedWedding = null;
  }
}
