import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WEDDING_CONFIG } from './config/wedding.config';
import { HeroComponent } from './hero/hero';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeroComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit, OnDestroy {
  config = WEDDING_CONFIG;

  isMobileMenuOpen = false;
  isScrolled = false;
  activeSectionId: string = 'inicio';

  get isOnHero(): boolean {
    return this.activeSectionId === 'inicio' && !this.isScrolled;
  }

  countdown = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isToday: false,
    isPast: false
  };

  private countdownInterval: any;

  // GALERÍA
  galleryPhotos = [
    'assets/optimized/DSC_5148.JPG',
    'assets/optimized/DSC_5178.JPG',
    'assets/optimized/DSC_5198.JPG',
    'assets/optimized/DSC_5210.JPG',
    'assets/optimized/DSC_5332.JPG',
    'assets/optimized/DSC_5340.JPG',
    'assets/optimized/DSC_5343.JPG',
    'assets/optimized/DSC_5422.JPG',
    'assets/optimized/DSC_5460.JPG',
    'assets/optimized/DSC_5471.JPG',
    'assets/optimized/DSC_5514.JPG',
    'assets/optimized/DSC_5523.JPG',
    'assets/optimized/DSC_5524.JPG',
    'assets/optimized/DSC_5612.JPG'
  ];
  currentPhotoIndex = 0;
  isGalleryMaximized = false;
  private carouselInterval: any;

  // AUDIO
  private audioPlayer!: HTMLAudioElement;
  isPlaying = false;
  volume = 0.5;
  isAudioWidgetOpen = false;
  private previousVolume = 0.5;

  ngOnInit(): void {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = 'smooth';
    this.initCountdown();
    this.startCarousel();

    const ids = this.config.menu.map((m) => m.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if ('IntersectionObserver' in window && sections.length) {
      const obs = new IntersectionObserver(
        (entries) => {
          const best = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

          if (best?.target?.id) this.activeSectionId = best.target.id;
        },
        {
          root: null,
          rootMargin: '-35% 0px -55% 0px',
          threshold: [0.01, 0.15, 0.3, 0.5, 0.7],
        },
      );

      sections.forEach((s) => obs.observe(s));
    }

    const initAnimations = () => {
      if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
              } else {
                entry.target.classList.remove('visible');
              }
            });
          },
          { threshold: 0.1 }
        );

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
          animationObserver.observe(el);
        });
      }
    };

    if (document.readyState === 'complete') {
      initAnimations();
    } else {
      window.addEventListener('load', initAnimations);
    }

    // Configurar audio global
    this.audioPlayer = document.getElementById('bg-audio') as HTMLAudioElement;

    window.addEventListener('weddingStarted', () => {
      this.isPlaying = true;
      if (this.audioPlayer) {
        this.audioPlayer.volume = this.volume;
      }
      this.cdr.detectChanges();
    });
  }

  constructor(private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) { }

  private initCountdown(): void {
    const targetDate = new Date('2026-10-17T00:00:00').getTime();

    const update = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      const oneDay = 24 * 60 * 60 * 1000;

      if (distance < 0 && distance > -oneDay) {
        this.countdown.isToday = true;
      } else if (distance <= -oneDay) {
        this.countdown.isPast = true;
      } else {
        this.countdown.days = Math.floor(distance / (1000 * 60 * 60 * 24));
        this.countdown.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.countdown.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        this.countdown.seconds = Math.floor((distance % (1000 * 60)) / 1000);
      }
      this.cdr.detectChanges();
    };

    update();
    this.countdownInterval = setInterval(update, 1000);
  }


  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.carouselInterval) clearInterval(this.carouselInterval);
  }

  // --- Carousel Methods ---
  startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.nextPhoto(false);
    }, 4000);
  }

  resetCarousel(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this.startCarousel();
  }

  nextPhoto(manual = true): void {
    this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.galleryPhotos.length;
    if (manual) this.resetCarousel();
  }

  prevPhoto(manual = true): void {
    this.currentPhotoIndex = (this.currentPhotoIndex - 1 + this.galleryPhotos.length) % this.galleryPhotos.length;
    if (manual) this.resetCarousel();
  }

  goToPhoto(index: number, manual = true): void {
    this.currentPhotoIndex = index;
    if (manual) this.resetCarousel();
  }

  toggleGalleryMaximize(): void {
    this.isGalleryMaximized = !this.isGalleryMaximized;
    document.body.style.overflow = this.isGalleryMaximized ? 'hidden' : '';
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 30;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.dragTranslatePx = 0;
    this.isDragging = false;
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.dragTranslatePx = 0; // 👈 reset
    this.isDragging = false; // 👈 reset
    document.body.style.overflow = '';
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;

    // deja un poco de aire arriba
    const y = el.getBoundingClientRect().top + window.scrollY - 8;
    window.scrollTo({ top: y, behavior: 'smooth' });
    this.activeSectionId = id;
    this.closeMobileMenu();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.closeMobileMenu();
  }

  // --- Swipe state ---
  isDragging = false;
  dragTranslatePx = 0;

  private touchStartY = 0;
  private lastTouchY = 0;

  onSheetTouchStart(ev: TouchEvent): void {
    if (!this.isMobileMenuOpen) return;

    this.isDragging = true;
    this.touchStartY = ev.touches[0].clientY;
    this.lastTouchY = this.touchStartY;
  }

  onSheetTouchMove(ev: TouchEvent): void {
    if (!this.isDragging) return;

    const y = ev.touches[0].clientY;
    const delta = y - this.touchStartY;

    // Solo permitimos arrastrar hacia abajo
    this.dragTranslatePx = Math.max(0, delta);
    this.lastTouchY = y;
  }

  onSheetTouchEnd(): void {
    if (!this.isDragging) return;

    const shouldClose = this.dragTranslatePx > 90; // umbral
    this.isDragging = false;

    if (shouldClose) {
      this.closeMobileMenu();
    } else {
      // vuelve a su sitio suavemente
      this.dragTranslatePx = 0;
    }
  }

  // --- Audio Methods ---
  togglePlay(): void {
    if (!this.audioPlayer) return;

    if (this.isPlaying) {
      this.audioPlayer.pause();
    } else {
      this.audioPlayer.play().catch(err => console.log('Autoplay prevent by browser:', err));
    }
    this.isPlaying = !this.isPlaying;
    this.isAudioWidgetOpen = true; // Mantener abierto si interactuó
  }

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.volume = parseFloat(input.value);
    if (this.audioPlayer) {
      this.audioPlayer.volume = this.volume;
    }
  }

  toggleMute(): void {
    if (this.volume > 0) {
      this.previousVolume = this.volume;
      this.volume = 0;
    } else {
      this.volume = this.previousVolume > 0 ? this.previousVolume : 0.5;
    }

    if (this.audioPlayer) {
      this.audioPlayer.volume = this.volume;
    }
  }
}
