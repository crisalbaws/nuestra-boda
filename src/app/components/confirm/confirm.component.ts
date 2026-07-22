import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WeddingService } from '../../services/wedding.service';
import { GuestService } from '../../services/guest.service';
import { ToastService } from '../../services/toast.service';
import { Wedding } from '../../models/wedding.model';
import { Guest } from '../../models/guest.model';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent implements OnInit {
  wedding: Wedding | null = null;
  phone: string = '';
  foundGuest: Guest | null = null;
  isAttending: boolean = true;
  plusOnesAdults: number = 0;
  plusOnesKids: number = 0;
  message: string = '';
  confirmationComplete: boolean = false;
  isSearching: boolean = false;
  notFound: boolean = false;
  alreadyConfirmed: boolean = false;
  errorMessage: string = '';
  showForm: boolean = false;
  showPhotoAnimation: boolean = true;

  constructor(
    private weddingService: WeddingService,
    private guestService: GuestService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    // Clear cache to ensure fresh data
    this.weddingService.clearCache();
  }

  async ngOnInit(): Promise<void> {
    this.wedding = await this.weddingService.getWedding();
    await this.checkInvitationLink();
    this.cdr.detectChanges();
  }

  private async checkInvitationLink(): Promise<void> {
    const hash = window.location.hash;
    const match = hash.match(/#\/confirm\/(.+)/);
    
    if (match && match[1]) {
      const encryptedId = match[1];
      const guest = await this.guestService.getGuestByEncryptedId(encryptedId);
      console.log('Guest found by encrypted ID:', guest);
      if (guest) {
        this.foundGuest = guest;
        this.plusOnesAdults = guest.plusOnesAdults;
        this.plusOnesKids = guest.plusOnesKids;

        if (guest.confirmed) {
          this.alreadyConfirmed = true;
        }
      } else {
        this.notFound = true;
        this.errorMessage = 'Esta invitación no es válida o ya no existe.';
      }
    }
  }

  async searchByPhone(): Promise<void> {
    if (!this.phone.trim()) {
      return;
    }

    this.isSearching = true;
    this.notFound = false;
    this.errorMessage = '';

    // Try to find by encrypted ID (from URL) or by phone
    const hash = window.location.hash;
    const match = hash.match(/#\/confirm\/(.+)/);

    if (match && match[1]) {
      const guest = await this.guestService.getGuestByEncryptedId(match[1]);
      if (guest) {
        this.foundGuest = guest;
        this.plusOnesAdults = guest.plusOnesAdults;
        this.plusOnesKids = guest.plusOnesKids;

        if (guest.confirmed) {
          this.alreadyConfirmed = true;
        }

        this.isSearching = false;
        return;
      }
    }

    this.isSearching = false;
    this.notFound = true;
    this.errorMessage = 'No encontramos tu invitación. Verifica el número o contacta a los novios.';
  }

  async confirmAttendance(): Promise<void> {
    if (!this.foundGuest) return;

    await this.guestService.updateGuest(this.foundGuest.id, {
      confirmed: this.isAttending,
      plusOnesAdults: this.plusOnesAdults,
      plusOnesKids: this.plusOnesKids,
      dietaryRestrictions: this.isAttending ? this.message : 'declined'
    });

    this.confirmationComplete = true;
  }

  reset(): void {
    this.phone = '';
    this.foundGuest = null;
    this.isAttending = true;
    this.plusOnesAdults = 0;
    this.plusOnesKids = 0;
    this.message = '';
    this.confirmationComplete = false;
    this.isSearching = false;
    this.notFound = false;
    this.alreadyConfirmed = false;
    this.errorMessage = '';

    // Clear URL parameter
    history.pushState('', document.title, window.location.pathname + '#/confirm');
  }

  goBack(): void {
    this.foundGuest = null;
    this.confirmationComplete = false;
    this.alreadyConfirmed = false;
  }

  onPhotoAnimationEnd(): void {
    this.showPhotoAnimation = false;
  }

  async copyToClipboard(text: string, label: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.toastService.success(`${label} copiada`);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }

  async copyAllInfo(): Promise<void> {
    if (!this.wedding) return;
    
    let info = `📋 Confirmación de Boda - ${this.wedding.partner1Name} & ${this.wedding.partner2Name}\n\n`;
    
    if (this.wedding.date) {
      info += `📅 Fecha: ${this.wedding.date}\n`;
    }
    
    if (this.wedding.templeTime || this.wedding.templeLocation) {
      info += `\n💒 Misa\n`;
      if (this.wedding.templeTime) {
        info += `🕐 Hora: ${this.wedding.templeTime}\n`;
      }
      if (this.wedding.templeLocation) {
        info += `📍 Lugar: ${this.wedding.templeLocation}\n`;
      }
      if (this.wedding.templeMapUrl) {
        info += `🗺️ Maps: ${this.wedding.templeMapUrl}\n`;
      }
    }
    
    if (this.wedding.partyTime || this.wedding.partyLocation) {
      info += `\n🎉 Recepción\n`;
      if (this.wedding.partyTime) {
        info += `🕐 Hora: ${this.wedding.partyTime}\n`;
      }
      if (this.wedding.partyLocation) {
        info += `📍 Lugar: ${this.wedding.partyLocation}\n`;
      }
      if (this.wedding.partyMapUrl) {
        info += `🗺️ Maps: ${this.wedding.partyMapUrl}\n`;
      }
    }
    
    try {
      await navigator.clipboard.writeText(info);
      this.toastService.success('✓ Información copiada');
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }
}
