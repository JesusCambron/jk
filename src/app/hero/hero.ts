import { Component, HostListener } from '@angular/core';
import { NgStyle } from '@angular/common';
import { WEDDING_CONFIG } from '../config/wedding.config';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css'],
})
export class HeroComponent {
  config = WEDDING_CONFIG;
  isStarted = true; // Siempre true al renderizar porque el padre controla el @if

  scrollToDetalles(): void {
    const el = document.getElementById('detalles');
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
}
