import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { WEDDING_CONFIG } from '../config/wedding.config';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css'],
})
export class HeroComponent implements OnInit, OnDestroy {
  config = WEDDING_CONFIG;
  isStarted = true; // Siempre true al renderizar porque el padre controla el @if

  private scrollTimeoutId: any;
  private hasUserScrolled = false;

  @Input() set userScrolled(val: boolean) {
    if (val) {
      this.hasUserScrolled = true;
      this.clearNudge();
    }
  }

  ngOnInit(): void {
    // 5 segundos después de que se renderiza el Hero (13s desde la apertura del sobre, aprox), hacemos el primer salto/nudge.
    this.scheduleNudge(13000);
  }

  private scheduleNudge(delay: number): void {
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    if (this.hasUserScrolled || scrollTop > 20) {
      this.hasUserScrolled = true;
      this.clearNudge();
      return;
    }

    this.scrollTimeoutId = setTimeout(() => {
      const currentScrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      if (this.hasUserScrolled || currentScrollTop > 20) {
        this.hasUserScrolled = true;
        this.clearNudge();
        return;
      }

      const heroEl = document.querySelector('.hero');
      if (heroEl) {
        heroEl.classList.add('nudge-active');
        
        // Remover la clase tras 1.2 segundos (para que complete la curva de subida y bajada)
        setTimeout(() => {
          heroEl.classList.remove('nudge-active');
        }, 1200);

        // Volver a programar el salto en 8 segundos (1.2s animación + 6.8s de pausa)
        this.scheduleNudge(8000);
      }
    }, delay);
  }

  ngOnDestroy(): void {
    this.clearNudge();
  }

  private clearNudge(): void {
    if (this.scrollTimeoutId) {
      clearTimeout(this.scrollTimeoutId);
    }
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      heroEl.classList.remove('nudge-active');
    }
  }
}
