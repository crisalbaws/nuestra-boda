import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts$ | async; track toast.id) {
        <div class="toast" [class]="toast.type">
          <span class="toast-icon">
            {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ' }}
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.remove(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
      font-family: 'Montserrat', sans-serif;
      min-width: 280px;
      max-width: 400px;
      background: white;
      border-left: 4px solid #a67c52;
    }

    .toast.success {
      border-left-color: #4caf50;
    }

    .toast.error {
      border-left-color: #f44336;
    }

    .toast.info {
      border-left-color: #a67c52;
    }

    .toast-icon {
      font-size: 1.2rem;
      font-weight: bold;
      color: #3d2e24;
    }

    .toast.success .toast-icon { color: #4caf50; }
    .toast.error .toast-icon { color: #f44336; }
    .toast.info .toast-icon { color: #a67c52; }

    .toast-message {
      flex: 1;
      font-size: 0.95rem;
      color: #3d2e24;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: #8b6340;
      font-size: 1.5rem;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.3s ease;
      padding: 0;
      line-height: 1;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
