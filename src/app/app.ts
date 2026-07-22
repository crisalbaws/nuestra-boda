import { Component, OnInit } from '@angular/core';
import { AdminComponent } from './components/admin/admin.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { ToastComponent } from './components/toast/toast.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AdminComponent, ConfirmComponent, ToastComponent, NotFoundComponent],
  template: `
    <div class="app-container">
      @switch (currentRoute) {
        @case ('admin') {
          <app-admin />
        }
        @case ('confirm') {
          @if (isValidInvitation) {
            <app-confirm />
          } @else {
            <app-not-found />
          }
        }
        @default {
          <app-not-found />
        }
      }
    </div>
    <app-toast />
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
    }
  `]
})
export class App implements OnInit {
  currentRoute: string = '';
  isValidInvitation: boolean = false;
  private supabaseService: SupabaseService;

  constructor() {
    this.supabaseService = new SupabaseService();
    this.updateRoute();
    window.addEventListener('hashchange', () => this.updateRoute());
  }

  ngOnInit(): void {
    this.updateRoute();
  }

  private async updateRoute(): Promise<void> {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const routeParts = hash.split('/');
    this.currentRoute = routeParts[0] || 'confirm';
    
    // Verificar si es una invitación válida
    if (this.currentRoute === 'confirm' && routeParts.length > 1) {
      const encryptedId = routeParts[1];
      const guest = await this.supabaseService.getGuestByEncryptedId(encryptedId);
      this.isValidInvitation = !!guest;
    } else {
      this.isValidInvitation = false;
    }
  }
}
