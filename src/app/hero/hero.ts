import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { WEDDING_CONFIG } from '../config/wedding.config';

export interface RandomLetter {
  char: string;
  delay: number;
}

export interface RandomWord {
  letters: RandomLetter[];
}

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

  coupleNamesWords: RandomWord[] = [];
  subtitleWords: RandomWord[] = [];

  private scrollTimeoutId: any;
  private hasUserScrolled = false;

  @Input() set userScrolled(val: boolean) {
    if (val) {
      this.hasUserScrolled = true;
      this.clearNudge();
    }
  }

  ngOnInit(): void {
    this.coupleNamesWords = this.splitToRandomWords(this.config.coupleNames, 3.2, 4.8);
    this.subtitleWords = this.splitToRandomWords(this.config.hero.subtitle, 4.2, 5.8);

    // 5 segundos después de que se renderiza el Hero, hacemos el primer salto/nudge.
    this.scheduleNudge(9000);
  }

  private splitToRandomWords(text: string, minDelay: number, maxDelay: number): RandomWord[] {
    if (!text) return [];
    const words = text.split(' ');
    const totalChars = words.reduce((acc, word) => acc + word.length, 0);
    if (totalChars === 0) return [];

    const step = (maxDelay - minDelay) / Math.max(1, totalChars - 1);

    const delays = Array.from({ length: totalChars }, (_, i) => minDelay + i * step);
    for (let i = delays.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [delays[i], delays[j]] = [delays[j], delays[i]];
    }

    let delayIndex = 0;
    return words.map(wordStr => ({
      letters: Array.from(wordStr).map(char => ({
        char,
        delay: Math.round(delays[delayIndex++] * 100) / 100
      }))
    }));
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
