import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private nextId = 0;
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  
  toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast: Toast = { id: this.nextId++, message, type };
    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);
    
    setTimeout(() => {
      this.remove(toast.id);
    }, 3000);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  getToasts(): Toast[] {
    return this.toasts;
  }
}
