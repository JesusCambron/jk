import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WEDDING_CONFIG } from './config/wedding.config';
import { HeroComponent } from './hero/hero';
import { LandingComponent } from './landing/landing';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeroComponent, LandingComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit, OnDestroy {
  config = WEDDING_CONFIG;

  isStarted = false;
  isFullScreenActive = false;
  isFullScreenSupported = false;
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
  isPlayerCollapsed = true;
  currentTime = 0;
  duration = 0;
  isMobileVolumeOpen = false;
  private previousVolume = 0.5;

  ngOnInit(): void {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = 'smooth';
    this.initCountdown();
    this.startCarousel();

    // Configurar audio global
    this.setupAudio();
    this.checkFullScreenSupport();
  }

  setupAudio(): void {
    if (this.audioPlayer) return;

    this.audioPlayer = document.getElementById('bg-audio') as HTMLAudioElement;
    if (this.audioPlayer) {
      // Sincronizar volumen inicial
      this.audioPlayer.volume = this.volume;
      // Sincronizar duración y tiempo por si ya cargaron
      if (this.audioPlayer.duration) {
        this.duration = this.audioPlayer.duration;
      }
      if (this.audioPlayer.currentTime) {
        this.currentTime = this.audioPlayer.currentTime;
      }
    }
  }

  initObservers(): void {
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
  }



  onInvitationOpened() {
    this.isStarted = true;
    this.cdr.detectChanges(); // Force Angular to render DOM elements

    // Initialize observers now that elements exist in the DOM
    this.initObservers();
    
    // Iniciar audio
    this.setupAudio();
    this.checkFullScreenSupport();
    if (this.audioPlayer && !this.isPlaying) {
      this.audioPlayer.play().then(() => {
        this.isPlaying = true;
        this.audioPlayer.volume = this.volume;
        this.cdr.detectChanges();
      }).catch(err => console.log('Audio blocked:', err));
    }

    // Activar pantalla completa
    this.activarPantallaCompleta();

    // Notificar a otros componentes (como el Hero)
    window.dispatchEvent(new CustomEvent('weddingStarted'));
  }

  checkFullScreenSupport(): void {
    const doc = document as any;
    this.isFullScreenSupported = !!(
      doc.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      doc.mozFullScreenEnabled ||
      doc.msFullscreenEnabled ||
      document.documentElement.requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen ||
      (document.documentElement as any).mozRequestFullScreen ||
      (document.documentElement as any).msRequestFullscreen
    );
  }

  activarPantallaCompleta(): void {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch((err: any) => console.log('Fullscreen blocked:', err));
      } else if (docEl.webkitRequestFullscreen) { /* Chrome, Safari y Opera */
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) { /* Firefox */
        docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) { /* IE/Edge */
        docEl.msRequestFullscreen();
      }
    } catch (e) {
      console.log('Fullscreen request failed:', e);
    }
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
    this.cdr.detectChanges();
  }

  prevPhoto(manual = true): void {
    this.currentPhotoIndex = (this.currentPhotoIndex - 1 + this.galleryPhotos.length) % this.galleryPhotos.length;
    if (manual) this.resetCarousel();
    this.cdr.detectChanges();
  }

  goToPhoto(index: number, manual = true): void {
    this.currentPhotoIndex = index;
    if (manual) this.resetCarousel();
    this.cdr.detectChanges();
  }

  toggleGalleryMaximize(): void {
    this.isGalleryMaximized = !this.isGalleryMaximized;
    document.body.style.overflow = this.isGalleryMaximized ? 'hidden' : '';
    this.cdr.detectChanges();
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
    this.setupAudio();
    this.checkFullScreenSupport();
    if (!this.audioPlayer) return;

    if (this.isPlaying) {
      this.audioPlayer.pause();
    } else {
      this.audioPlayer.play().catch(err => console.log('Autoplay prevent by browser:', err));
    }
    this.isPlaying = !this.isPlaying;
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

  togglePlayerCollapse(): void {
    this.isPlayerCollapsed = !this.isPlayerCollapsed;
  }

  restartAudio(): void {
    if (this.audioPlayer) {
      this.audioPlayer.currentTime = 0;
      this.currentTime = 0;
      if (!this.isPlaying) {
        this.audioPlayer.play().then(() => {
          this.isPlaying = true;
          this.cdr.detectChanges();
        }).catch(err => console.log('Play failed:', err));
      }
    }
  }

  onSeek(event: Event): void {
    this.setupAudio();
    this.checkFullScreenSupport();
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    if (this.audioPlayer) {
      this.audioPlayer.currentTime = value;
      this.currentTime = value;
    }
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  toggleVolumeSlider(event: Event): void {
    if (window.innerWidth <= 768) {
      event.stopPropagation();
      this.isMobileVolumeOpen = !this.isMobileVolumeOpen;
    } else {
      this.toggleMute();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isMobileVolumeOpen) {
      this.isMobileVolumeOpen = false;
    }
  }

  onTimeUpdate(audio: HTMLAudioElement): void {
    this.currentTime = audio.currentTime;
    if (!this.duration && audio.duration) {
      this.duration = audio.duration;
    }
    this.cdr.detectChanges();
  }

  onDurationChange(audio: HTMLAudioElement): void {
    this.duration = audio.duration || 0;
    this.cdr.detectChanges();
  }

  onLoadedMetadata(audio: HTMLAudioElement): void {
    this.duration = audio.duration || 0;
    this.cdr.detectChanges();
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  @HostListener('document:mozfullscreenchange')
  @HostListener('document:MSFullscreenChange')
  onFullscreenChange(): void {
    const doc = document as any;
    this.isFullScreenActive = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
    this.cdr.detectChanges();
  }

  toggleFullScreen(): void {
    if (this.isFullScreenActive) {
      this.salirPantallaCompleta();
    } else {
      this.activarPantallaCompleta();
    }
  }

  salirPantallaCompleta(): void {
    const doc = document as any;
    if (doc.exitFullscreen) {
      doc.exitFullscreen().catch((err: any) => console.log('Exit fullscreen failed:', err));
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  }
}