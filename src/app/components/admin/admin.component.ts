import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WeddingService } from '../../services/wedding.service';
import { GuestService } from '../../services/guest.service';
import { ToastService } from '../../services/toast.service';
import { PdfService } from '../../services/pdf.service';
import { Wedding } from '../../models/wedding.model';
import { Guest } from '../../models/guest.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  wedding: Wedding = { id: '', partner1Name: '', partner2Name: '' };
  guests: Guest[] = [];
  
  newGuestName: string = '';
  newGuestNickname: string = '';
  newGuestPhone: string = '';
  newGuestPlusOnesAdults: number = 1;
  newGuestPlusOnesKids: number = 0;
  
  // Auth
  isAuthenticated: boolean = false;
  username: string = '';
  password: string = '';
  authError: boolean = false;
  
  // Link generation
  generatedLink: string = '';
  generatedMessage: string = '';
  useNickname: boolean = false;
  linkCopied: boolean = false;
  selectedGuestForLink: Guest | null = null;
  
  // Edit guest
  guestToEdit: Guest | null = null;
  editAdults: number = 1;
  editKids: number = 0;
  
  // Stats
  confirmedCount: number = 0;
  declinedCount: number = 0;
  pendingCount: number = 0;
  totalAdults: number = 0;
  totalKids: number = 0;
  totalGeneral: number = 0;
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  
  get totalPages(): number {
    return Math.ceil(this.guests.length / this.pageSize);
  }
  
  get paginatedGuests(): Guest[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.guests.slice(start, start + this.pageSize);
  }
  
  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  // Constants
  readonly ADMIN_USER = 'sysAdmin';
  readonly ADMIN_PASS = 'Pass123$';

  constructor(
    private weddingService: WeddingService,
    private guestService: GuestService,
    private toastService: ToastService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef
  ) {
    // Validar que la sesión sea del día actual
    const authData = sessionStorage.getItem('admin_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const today = new Date().toDateString();
        this.isAuthenticated = parsed.date === today;
        if (!this.isAuthenticated) {
          sessionStorage.removeItem('admin_auth');
        }
      } catch {
        this.isAuthenticated = false;
        sessionStorage.removeItem('admin_auth');
      }
    }
  }

  async ngOnInit(): Promise<void> {
    if (this.isAuthenticated) {
      await this.loadData();
    }
  }

  async login(): Promise<void> {
    if (this.username === this.ADMIN_USER && this.password === this.ADMIN_PASS) {
      this.isAuthenticated = true;
      this.authError = false;
      // Guardar sesión con fecha del día
      const sessionData = { date: new Date().toDateString() };
      sessionStorage.setItem('admin_auth', JSON.stringify(sessionData));
      await this.loadData();
      this.cdr.detectChanges();
    } else {
      this.authError = true;
    }
  }

  logout(): void {
    this.isAuthenticated = false;
    sessionStorage.removeItem('admin_auth');
    this.username = '';
    this.password = '';
  }

  async loadData(): Promise<void> {
    const savedWedding = await this.weddingService.getWedding();
    if (savedWedding) {
      this.wedding = savedWedding;
    }
    this.guests = await this.guestService.getGuests();
    this.currentPage = 1; // Reset to first page
    await this.loadStats();
    this.cdr.detectChanges();
  }

  async loadStats(): Promise<void> {
    this.confirmedCount = await this.guestService.getConfirmedCount();
    this.declinedCount = await this.guestService.getDeclinedCount();
    this.pendingCount = await this.guestService.getPendingCount();
    
    // Calculate adults, kids and total from confirmed guests
    const confirmedGuests = this.guests.filter(g => g.confirmed);
    this.totalAdults = confirmedGuests.reduce((sum, g) => sum + g.plusOnesAdults, 0);
    this.totalKids = confirmedGuests.reduce((sum, g) => sum + g.plusOnesKids, 0);
    this.totalGeneral = this.totalAdults + this.totalKids;
  }

  async saveWeddingConfig(): Promise<void> {
    if (this.wedding.id) {
      await this.weddingService.updateWedding(this.wedding);
    } else {
      this.wedding.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      await this.weddingService.saveWedding(this.wedding);
    }
    this.toastService.success('¡Configuración guardada!');
  }

  async addGuest(): Promise<void> {
    if (!this.newGuestName.trim()) {
      this.toastService.error('Por favor ingresa un nombre');
      return;
    }
    
    if (!this.newGuestPhone.trim()) {
      this.toastService.error('Por favor ingresa un número de celular');
      return;
    }

    if (this.newGuestPlusOnesAdults < 1) {
      this.toastService.error('Debe haber al menos 1 adulto');
      return;
    }

    const guests = await this.guestService.getGuests();
    const phoneExists = guests.some(g => g.phone === this.newGuestPhone.trim());
    if (phoneExists) {
      this.toastService.error('Este número de celular ya está registrado');
      return;
    }
    
    await this.guestService.addGuest({
      name: this.newGuestName.trim(),
      nickname: this.newGuestNickname.trim() || undefined,
      phone: this.newGuestPhone.trim(),
      plusOnesAdults: this.newGuestPlusOnesAdults,
      plusOnesKids: this.newGuestPlusOnesKids
    });
    
    this.newGuestName = '';
    this.newGuestNickname = '';
    this.newGuestPhone = '';
    this.newGuestPlusOnesAdults = 1;
    this.newGuestPlusOnesKids = 0;
    await this.loadData();
    this.toastService.success('Invitado agregado exitosamente');
  }

  async confirmGuest(guest: Guest): Promise<void> {
    await this.guestService.updateGuest(guest.id, { confirmed: true });
    await this.loadData();
    this.toastService.success(`${guest.name} confirmado`);
  }

  async declineGuest(guest: Guest): Promise<void> {
    await this.guestService.updateGuest(guest.id, { confirmed: false, dietaryRestrictions: 'declined' });
    await this.loadData();
    this.toastService.info(`${guest.name} marcado como no asistirá`);
  }

  async removeGuest(guest: Guest): Promise<void> {
    if (confirm(`¿Eliminar a ${guest.name}?`)) {
      await this.guestService.deleteGuest(guest.id);
      await this.loadData();
      this.toastService.success('Invitado eliminado');
    }
  }

  generateLink(guest: Guest): void {
    this.selectedGuestForLink = guest;
    this.generatedLink = this.guestService.generateInvitationLink(guest);
    this.useNickname = false;
    this.regenerateMessage();
    this.linkCopied = false;
  }

  regenerateMessage(): void {
    if (!this.selectedGuestForLink) return;
    const name = this.useNickname && this.selectedGuestForLink.nickname 
      ? this.selectedGuestForLink.nickname 
      : this.selectedGuestForLink.name;
    const partner1 = this.wedding.partner1Name || 'Karla';
    const partner2 = this.wedding.partner2Name || 'Alex';
    this.generatedMessage = `¡Hola ${name}! Estás invitado/a a la boda de ${partner1} & ${partner2}. Confirma tu asistencia aquí: ${this.generatedLink}`;
  }

  copyMessage(): void {
    navigator.clipboard.writeText(this.generatedMessage).then(() => {
      this.linkCopied = true;
      this.toastService.success('Mensaje copiado al portapapeles');
      setTimeout(() => this.linkCopied = false, 2000);
    });
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.generatedLink).then(() => {
      this.linkCopied = true;
      this.toastService.success('Enlace copiado al portapapeles');
      setTimeout(() => this.linkCopied = false, 2000);
    });
  }

  closeLinkModal(): void {
    this.selectedGuestForLink = null;
    this.generatedLink = '';
    this.generatedMessage = '';
  }

  getWhatsAppLink(): string {
    return `https://wa.me/52${this.selectedGuestForLink?.phone}?text=${encodeURIComponent(this.generatedMessage)}`;
  }

  editGuest(guest: Guest): void {
    this.guestToEdit = guest;
    this.editAdults = guest.plusOnesAdults;
    this.editKids = guest.plusOnesKids;
  }

  closeEditModal(): void {
    this.guestToEdit = null;
    this.editAdults = 1;
    this.editKids = 0;
  }

  async saveGuestEdit(): Promise<void> {
    if (!this.guestToEdit) return;
    
    if (this.editAdults < 1) {
      this.toastService.error('Debe haber al menos 1 adulto');
      return;
    }
    
    await this.guestService.updateGuest(this.guestToEdit.id, {
      plusOnesAdults: this.editAdults,
      plusOnesKids: this.editKids
    });
    
    this.closeEditModal();
    await this.loadData();
    this.toastService.success('Cantidad actualizada');
  }

  downloadPdf(): void {
    this.pdfService.generateGuestListPdf(this.wedding, this.guests);
    this.toastService.success('PDF generado exitosamente');
  }
}
