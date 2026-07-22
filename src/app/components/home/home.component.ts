import { Component, OnInit } from '@angular/core';
import { WeddingService } from '../../services/wedding.service';
import { Wedding } from '../../models/wedding.model';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  wedding: Wedding | null = null;

  constructor(private weddingService: WeddingService) {}

  async ngOnInit(): Promise<void> {
    this.wedding = await this.weddingService.getWedding();
  }
}
