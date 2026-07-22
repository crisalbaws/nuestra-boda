import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="icon">💔</div>
        <h1>404</h1>
        <p>Esta página no existe</p>
        <p class="sub-text">Verifica el enlace o contacta a los novios</p>
        <a href="#/" class="home-btn">Volver al inicio</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f0eb 0%, #e8dfd5 100%);
      padding: 1rem;
    }

    .not-found-content {
      text-align: center;
      background: white;
      padding: 3rem 2rem;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(93, 74, 58, 0.15);
      max-width: 400px;
    }

    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 4rem;
      color: #3d2e24;
      margin: 0 0 0.5rem;
    }

    p {
      color: #5c4a3a;
      font-size: 1.1rem;
      margin: 0.5rem 0;
    }

    .sub-text {
      font-size: 0.9rem;
      color: #8b6340;
    }

    .home-btn {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.875rem 2rem;
      background: linear-gradient(135deg, #a67c52 0%, #8b6340 100%);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(166, 124, 82, 0.4);
    }

    .home-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(166, 124, 82, 0.5);
    }
  `]
})
export class NotFoundComponent {}
