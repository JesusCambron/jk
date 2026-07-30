import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { Firestore, doc, getDoc, setDoc, collection, addDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { WEDDING_CONFIG } from './config/wedding.config';
import { HeroComponent } from './hero/hero';
import { LandingComponent } from './landing/landing';

export interface RandomLetter {
  char: string;
  delay: number;
}

export interface RandomWord {
  letters: RandomLetter[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeroComponent, LandingComponent, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit, OnDestroy {
  config: typeof WEDDING_CONFIG = WEDDING_CONFIG;
  invalidCode = false;
  showChurch = true;
  currentCode = '';

  footerCopyrightWords: RandomWord[] = [];
  footerNamesWords: RandomWord[] = [];

  isLoading = true;
  showLoadingDOM = true;

  rsvpAsistentes = 1;
  rsvpNombres: string[] = [''];
  rsvpMensaje = '';
  rsvpSubmitted = false;
  rsvpSubmitting = false;
  maxInvitados = 2;
  rsvpAsistencia = true;
  rsvpCancion = '';
  rsvpDeclinedName = '';

  // Custom Alert Modal State
  showAlertModal = false;
  alertModalTitle = '';
  alertModalMessage = '';
  alertModalIcon = 'warning'; // 'warning' | 'error' | 'success'
  alertModalBtnText = 'Entendido';

  isStarted = false;
  isFullScreenActive = false;
  isFullScreenSupported = false;
  isMobileMenuOpen = false;
  isScrolled = false;
  activeSectionId: string = 'inicio';
  showScrollArrow = false;
  showMusicPlayer = false;
  copiedStates: { [key: string]: boolean } = {
    liverpool: false,
    bbva: false
  };
  private arrowTimerFinished = false;
  private onScrollBound = () => this.onScroll();
  private sectionRatios: { [id: string]: number } = {};
  private lastScrollY = 0;
  scrollDirection: 'down' | 'up' = 'down';

  observerConfigs: {
    [id: string]: {
      enter?: string | number;
      exit?: string | number;
      enterBottom?: string | number;
      exitTop?: string | number;
      enterTop?: string | number;
      exitBottom?: string | number;
      threshold?: number | number[];
    }
  } = {
    // Detalles
    'imagen-detalles': { 
      enterBottom: '92%', 
      exitTop: '12%', 
      enterTop: '12%', 
      exitBottom: '92%', 
      threshold: 0.0 
    },
    'texto-detalles': { 
      enterBottom: '92%', 
      exitTop: '12%', 
      enterTop: '12%', 
      exitBottom: '92%', 
      threshold: 0.0 
    },
    'detalles': {
      enterBottom: '92%',
      exitTop: '12%',
      enterTop: '12%',
      exitBottom: '92%',
      threshold: 0.0
    },

    // Itinerario
    'itinerario-timeline': { 
      enterBottom: '92%', 
      exitTop: '12%', 
      enterTop: '12%', 
      exitBottom: '92%', 
      threshold: 0.0 
    },
    'foto-itinerario': { 
      enterBottom: '92%', 
      exitTop: '12%', 
      enterTop: '12%', 
      exitBottom: '92%', 
      threshold: 0.0 
    },
    'itinerario': {
      enterBottom: '92%',
      exitTop: '12%',
      enterTop: '12%',
      exitBottom: '92%',
      threshold: 0.0
    },

    // Ubicación
    'ubicacion': { 
      enterBottom: '92%', 
      exitTop: '12%', 
      enterTop: '12%', 
      exitBottom: '92%', 
      threshold: 0.0 
    },

    // Cuenta regresiva
    'cuenta-regresiva': { 
      enterBottom: '92%', 
      exitTop: '12%', 
      enterTop: '12%', 
      exitBottom: '92%', 
      threshold: 0.0 
    },

    // Confirmación
    'confirmacion': { 
      enterBottom: '92%', 
      exitTop: '12%', 
      enterTop: '12%', 
      exitBottom: '92%', 
      threshold: 0.0 
    },

    // Regalos
    'regalos': { 
      enterBottom: '92%', 
      exitTop: '12%', 
      enterTop: '12%', 
      exitBottom: '92%', 
      threshold: 0.0 
    },

    // Dress Code
    'dress-code': { 
      enterBottom: '92%', 
      exitTop: '12%', 
      enterTop: '12%', 
      exitBottom: '92%', 
      threshold: 0.0 
    },

    // Galería
    'galeria': { 
      enterBottom: '92%', 
      exitTop: '12%', 
      enterTop: '12%', 
      exitBottom: '92%', 
      threshold: 0.0 
    },

    // Footer decor
    'footer-decor': {
      enterBottom: '95%',
      exitTop: '5%',
      enterTop: '5%',
      exitBottom: '95%',
      threshold: 0.0
    }
  };

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

  // GALERÍA (Carrusel desactivado)
  galleryPhotos: string[] = [];
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

  preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // resolver de todos modos
        img.src = url;
      });
    });
    return Promise.all(promises).then(() => {});
  }

  splitToRandomWords(text: string, minDelay = 0.1, maxDelay = 1.4): RandomWord[] {
    if (!text) return [];
    const words = text.split(' ');
    const totalChars = words.reduce((acc, w) => acc + w.length, 0);
    const step = (maxDelay - minDelay) / Math.max(totalChars - 1, 1);

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

  ngOnInit(): void {
    window.addEventListener('scroll', this.onScrollBound, { capture: true, passive: true });
    document.addEventListener('scroll', this.onScrollBound, { capture: true, passive: true });

    this.footerCopyrightWords = this.splitToRandomWords('Con cariño', 0.1, 1.2);
    this.footerNamesWords = this.splitToRandomWords(this.config.coupleNames, 0.3, 1.6);

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = 'auto';
    this.initCountdown();
    this.startCarousel();

    // Configurar audio global
    this.setupAudio();
    this.checkFullScreenSupport();

    // Escuchar parámetros de consulta (código de invitado/grupo)
    // 1. Lectura inmediata al arrancar (evita retardos de carga)
    const initialCode = new URLSearchParams(window.location.search).get('code') || 
                        this.router.parseUrl(this.router.url).queryParams['code'];
    
    const criticalAssets = [
      'assets/optimized/jk_logo.png',
      'assets/optimized/sellob.png',
      'assets/optimized/DSC_5070.JPG',
      'assets/optimized/columna3c.jpeg'
    ];

    const secondaryAssets = [
      'https://www.transparenttextures.com/patterns/cream-paper.png',
      'https://www.transparenttextures.com/patterns/natural-paper.png',
      'assets/optimized/background5.png',
      'assets/optimized/nos-casamos4.jpg',
      'assets/optimized/anillo2.png',
      'assets/optimized/detalles.jpeg',
      'assets/optimized/itinerario2.jpeg',
      'assets/optimized/itinerario3.png',
      'assets/optimized/iglesia2.png',
      'assets/optimized/local.png',
      'assets/optimized/amazon.svg',
      'assets/optimized/bbva.svg',
      'assets/optimized/columna1.jpeg',
      'assets/optimized/columna2.jpeg',
      'assets/optimized/DSC_5178.JPG',
      'assets/optimized/f2.png'
    ];

    const fontsPromise = (document as any).fonts 
      ? (document as any).fonts.ready 
      : Promise.resolve();

    const guestPromise = initialCode 
      ? this.loadGuest(initialCode) 
      : Promise.resolve().then(() => { this.invalidCode = false; });

    const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 4000));

    const loadAllResources = Promise.all([
      guestPromise,
      this.preloadImages(criticalAssets),
      fontsPromise
    ]);

    Promise.race([loadAllResources, timeoutPromise]).then(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.showLoadingDOM = false;
        this.cdr.detectChanges();
        // Precargar resto de imágenes en segundo plano sin bloquear la pantalla inicial
        this.preloadImages(secondaryAssets);
      }, 600);
    });

    // 2. Suscripción a cambios de navegación futuros
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const code = this.router.parseUrl(this.router.url).queryParams['code'];
      if (code) {
        this.invalidCode = false;
        this.loadGuest(code);
      } else {
        this.invalidCode = true;
        this.cdr.detectChanges();
      }
    });
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

  async loadGuest(code: string): Promise<void> {
    try {
      const ref = doc(this.firestore, 'grupos', code);
      const snap = await getDoc(ref);
      
      if (snap.exists()) {
        this.currentCode = code;
        const data = snap.data();
        this.config = { ...WEDDING_CONFIG, ...data } as any;
        this.showChurch = (this.config as any).mostrarIglesia === true;
        
        if (data && data['maxInvitados'] !== undefined) {
          this.maxInvitados = Number(data['maxInvitados']);
        } else if (data && data['pases'] !== undefined) {
          this.maxInvitados = Number(data['pases']);
        } else {
          this.maxInvitados = 2;
        }

        this.cdr.detectChanges();
      } else {
        this.invalidCode = true;
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error al cargar la información del invitado:', error);
      this.invalidCode = true;
      this.cdr.detectChanges();
    }
  }

  get itineraryItems() {
    if (!this.config?.itinerario?.items) return [];
    return this.config.itinerario.items.filter((item: any) => item.icon !== 'church' || this.showChurch);
  }

  getItemUrl(item: any): string {
    if (item?.url) return item.url;
    if (item?.icon === 'church') {
      return this.config?.ubicacion?.iglesia?.url || 'https://maps.app.goo.gl/xbxkVevHgarcuDD2A';
    }
    return this.config?.ubicacion?.hacienda?.url || 'https://maps.app.goo.gl/uKNwHasSRjuhehaX8';
  }

  get maxRsvpPases(): number {
    return this.maxInvitados;
  }

  get rsvpOptions(): number[] {
    return Array.from({ length: this.maxRsvpPases }, (_, i) => i + 1);
  }

  onAsistentesChange(num: number): void {
    this.rsvpAsistentes = num;
    const currentLength = this.rsvpNombres.length;
    if (num > currentLength) {
      for (let i = currentLength; i < num; i++) {
        this.rsvpNombres.push('');
      }
    } else if (num < currentLength) {
      this.rsvpNombres = this.rsvpNombres.slice(0, num);
    }
    this.cdr.detectChanges();
  }

  onAsistentesInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value;

    // Remove anything that is not a digit
    val = val.replace(/[^0-9]/g, '');

    let num = parseInt(val, 10);

    if (isNaN(num) || num <= 0) {
      input.value = val;
      this.rsvpAsistentes = 0;
      this.rsvpNombres = [];
    } else {
      if (num > 10) {
        num = 10;
      }
      input.value = num.toString();
      this.onAsistentesChange(num);
    }
    this.cdr.detectChanges();
  }

  preventInvalidInputCharacters(event: KeyboardEvent): void {
    if (['.', ',', 'e', 'E', '-', '+'].includes(event.key)) {
      event.preventDefault();
    }
  }

  setAsistencia(value: boolean): void {
    this.rsvpAsistencia = value;
    this.cdr.detectChanges();
  }

  get isFormInvalid(): boolean {
    if (this.rsvpAsistencia) {
      if (this.maxInvitados === 0 && (isNaN(this.rsvpAsistentes) || this.rsvpAsistentes <= 0 || this.rsvpAsistentes > 10 || !Number.isInteger(this.rsvpAsistentes))) {
        return true;
      }
      return this.rsvpNombres.length === 0 || this.rsvpNombres.some(name => !name || !name.trim());
    } else {
      return !this.rsvpMensaje || !this.rsvpMensaje.trim();
    }
  }

  showAlert(message: string, title: string = 'Atención', icon: string = 'warning', btnText: string = 'Entendido'): void {
    this.alertModalTitle = title;
    this.alertModalMessage = message;
    this.alertModalIcon = icon;
    this.alertModalBtnText = btnText;
    this.showAlertModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeAlert(): void {
    this.showAlertModal = false;
    document.body.style.overflow = (this.isGalleryMaximized || this.isMobileMenuOpen) ? 'hidden' : '';
    this.cdr.detectChanges();
  }

  async submitRsvp(): Promise<void> {
    if (this.isFormInvalid) {
      if (this.rsvpAsistencia) {
        this.showAlert(
          'Por favor, ingresa los nombres completos de todos los asistentes.',
          'Formulario incompleto',
          'warning'
        );
      } else {
        this.showAlert(
          'Por favor, escribe un mensaje de felicitación para poder enviar.',
          'Formulario incompleto',
          'warning'
        );
      }
      return;
    }

    this.rsvpSubmitting = true;
    this.cdr.detectChanges();

    try {
      await addDoc(collection(this.firestore, 'confirmaciones'), {
        asistencia: this.rsvpAsistencia,
        asistentes: this.rsvpAsistencia ? this.rsvpAsistentes : 0,
        nombres: this.rsvpAsistencia 
          ? this.rsvpNombres.map(name => name.trim()) 
          : (this.rsvpDeclinedName.trim() ? [this.rsvpDeclinedName.trim()] : []),
        mensaje: this.rsvpMensaje.trim(),
        cancion: this.rsvpAsistencia ? this.rsvpCancion.trim() : '',
        fecha: new Date(),
        code: this.currentCode
      });

      this.rsvpSubmitted = true;
    } catch (error) {
      console.error('Error al guardar la confirmación:', error);
      this.showAlert(
        'Hubo un error al guardar tu confirmación. Por favor, intenta de nuevo.',
        'Error de red',
        'error'
      );
    } finally {
      this.rsvpSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  initObservers(): void {
    const ids = this.config.menu.map((m) => m.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    // Función auxiliar para convertir enter/exit a rootMargin en porcentaje de pantalla
    const getRootMarginFromEnterExit = (
      enter: string | number | undefined,
      exit: string | number | undefined,
      defaultMargin: string
    ): string => {
      if (enter === undefined && exit === undefined) return defaultMargin;

      const parsePct = (val: string | number | undefined): number | null => {
        if (val === undefined) return null;
        if (typeof val === 'number') {
          return val <= 1 ? val * 100 : val;
        }
        return parseFloat(val);
      };

      const enterPct = parsePct(enter);
      const exitPct = parsePct(exit);

      const topPart = exitPct !== null ? `-${exitPct}%` : '0px';
      const bottomPart = enterPct !== null ? `-${100 - enterPct}%` : '0px';

      return `${topPart} 0px ${bottomPart} 0px`;
    };

    // 1. Observador para el Menú de Navegación (Configuración por ID o Atributos - Bidireccional)
    if ('IntersectionObserver' in window && sections.length) {
      sections.forEach((s) => {
        const id = s.id;
        const config = this.observerConfigs[id];

        let navMarginDown = '-35% 0px -55% 0px';
        let navMarginUp = '-35% 0px -55% 0px';
        let navThreshold: number | number[] = [0.01, 0.15, 0.3, 0.5, 0.7];

        if (config) {
          const enterBottom = config.enterBottom !== undefined ? config.enterBottom : (config.enter !== undefined ? config.enter : '85%');
          const exitTop = config.exitTop !== undefined ? config.exitTop : (config.exit !== undefined ? config.exit : '15%');
          const enterTop = config.enterTop !== undefined ? config.enterTop : exitTop;
          const exitBottom = config.exitBottom !== undefined ? config.exitBottom : enterBottom;

          navMarginDown = getRootMarginFromEnterExit(enterBottom, exitTop, navMarginDown);
          navMarginUp = getRootMarginFromEnterExit(exitBottom, enterTop, navMarginUp);

          if (config.threshold !== undefined) {
            navThreshold = Array.isArray(config.threshold) ? config.threshold : [config.threshold];
          }
        } else {
          // Fallback a atributos HTML
          const getAttr = (attr: string): string | null => {
            return s.getAttribute(attr) || s.querySelector(`[${attr}]`)?.getAttribute(attr) || null;
          };

          const enterBottom = getAttr('data-nav-enter-bottom') || getAttr('data-nav-enter');
          const exitTop = getAttr('data-nav-exit-top') || getAttr('data-nav-exit');
          const enterTop = getAttr('data-nav-enter-top') || exitTop;
          const exitBottom = getAttr('data-nav-exit-bottom') || enterBottom;

          if (enterBottom || exitTop) {
            navMarginDown = getRootMarginFromEnterExit(enterBottom || '85%', exitTop || '15%', navMarginDown);
            navMarginUp = getRootMarginFromEnterExit(exitBottom || '85%', enterTop || '15%', navMarginUp);
          } else {
            const fallbackMargin = getAttr('data-nav-margin') || '-35% 0px -55% 0px';
            navMarginDown = fallbackMargin;
            navMarginUp = fallbackMargin;
          }

          const thresholdStr = getAttr('data-nav-threshold');
          if (thresholdStr) {
            navThreshold = thresholdStr.split(',').map(Number);
          }
        }

        const handleMenuIntersection = (entries: IntersectionObserverEntry[]) => {
          entries.forEach(entry => {
            const entryId = entry.target.id;
            this.sectionRatios[entryId] = entry.isIntersecting ? entry.intersectionRatio : 0;
          });

          // Buscar la sección visible con mayor ratio
          let bestId = this.activeSectionId;
          let maxRatio = 0;
          for (const keyId in this.sectionRatios) {
            if (this.sectionRatios[keyId] > maxRatio) {
              maxRatio = this.sectionRatios[keyId];
              bestId = keyId;
            }
          }

          if (maxRatio > 0 && bestId !== this.activeSectionId) {
            this.activeSectionId = bestId;
            this.cdr.detectChanges();
          }
        };

        // Observador de bajada
        const obsDown = new IntersectionObserver(
          (entries) => {
            if (this.scrollDirection !== 'down') return;
            handleMenuIntersection(entries);
          },
          {
            root: null,
            rootMargin: navMarginDown,
            threshold: navThreshold,
          }
        );
        obsDown.observe(s);

        // Observador de subida
        const obsUp = new IntersectionObserver(
          (entries) => {
            if (this.scrollDirection !== 'up') return;
            handleMenuIntersection(entries);
          },
          {
            root: null,
            rootMargin: navMarginUp,
            threshold: navThreshold,
          }
        );
        obsUp.observe(s);
      });
    }

    // 2. Observador para Animaciones (Mapeo centralizado por ID o atributos HTML en cascada - Bidireccional)
    if ('IntersectionObserver' in window) {
      const downConfigGroups = new Map<string, { margin: string; threshold: number | number[]; elements: Element[] }>();
      const upConfigGroups = new Map<string, { margin: string; threshold: number | number[]; elements: Element[] }>();

      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        const id = el.id;
        const parentSection = el.closest('section') || el.closest('footer');
        const parentId = parentSection ? parentSection.id : null;

        // Intentar obtener de la configuración centralizada (por ID del elemento o por ID de la sección padre)
        const config = (id && this.observerConfigs[id]) || 
                       (parentId && this.observerConfigs[parentId]) || 
                       (el.classList.contains('footer-decor') ? this.observerConfigs['footer-decor'] : null);

        let animMarginDown = '-15% 0px 0px 0px';
        let animMarginUp = '-15% 0px 0px 0px';
        let animThreshold: number | number[] = 0.3;

        if (config) {
          const enterBottom = config.enterBottom !== undefined ? config.enterBottom : (config.enter !== undefined ? config.enter : '85%');
          const exitTop = config.exitTop !== undefined ? config.exitTop : (config.exit !== undefined ? config.exit : '15%');
          const enterTop = config.enterTop !== undefined ? config.enterTop : exitTop;
          const exitBottom = config.exitBottom !== undefined ? config.exitBottom : enterBottom;

          animMarginDown = getRootMarginFromEnterExit(enterBottom, exitTop, animMarginDown);
          animMarginUp = getRootMarginFromEnterExit(exitBottom, enterTop, animMarginUp);

          if (config.threshold !== undefined) {
            animThreshold = config.threshold;
          }
        } else {
          // Fallback a atributos HTML (directo o ancestros)
          const getAttr = (attr: string): string | null => {
            return el.getAttribute(attr) || el.closest(`[${attr}]`)?.getAttribute(attr) || null;
          };

          const enterBottom = getAttr('data-anim-enter-bottom') || getAttr('data-anim-enter');
          const exitTop = getAttr('data-anim-exit-top') || getAttr('data-anim-exit');
          const enterTop = getAttr('data-anim-enter-top') || exitTop;
          const exitBottom = getAttr('data-anim-exit-bottom') || enterBottom;

          if (enterBottom || exitTop) {
            animMarginDown = getRootMarginFromEnterExit(enterBottom || '85%', exitTop || '15%', animMarginDown);
            animMarginUp = getRootMarginFromEnterExit(exitBottom || '85%', enterTop || '15%', animMarginUp);
          } else {
            const fallbackMargin = getAttr('data-anim-margin') || '-15% 0px 0px 0px';
            animMarginDown = fallbackMargin;
            animMarginUp = fallbackMargin;
          }

          const thresholdStr = getAttr('data-anim-threshold') || '0.3';
          animThreshold = thresholdStr.includes(',')
            ? thresholdStr.split(',').map(Number)
            : Number(thresholdStr);
        }

        const keyDown = `${animMarginDown}::${JSON.stringify(animThreshold)}`;
        if (!downConfigGroups.has(keyDown)) {
          downConfigGroups.set(keyDown, {
            margin: animMarginDown,
            threshold: animThreshold,
            elements: []
          });
        }
        downConfigGroups.get(keyDown)!.elements.push(el);

        const keyUp = `${animMarginUp}::${JSON.stringify(animThreshold)}`;
        if (!upConfigGroups.has(keyUp)) {
          upConfigGroups.set(keyUp, {
            margin: animMarginUp,
            threshold: animThreshold,
            elements: []
          });
        }
        upConfigGroups.get(keyUp)!.elements.push(el);
      });

      // 2a. Instanciar observadores de bajada (scroll direction 'down')
      downConfigGroups.forEach((group) => {
        const observer = new IntersectionObserver(
          (entries) => {
            if (this.scrollDirection !== 'down') return;
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.remove('exited-top');
              } else {
                entry.target.classList.remove('visible');
                const rect = entry.boundingClientRect;
                if (rect.top < window.innerHeight / 2) {
                  entry.target.classList.add('exited-top');
                } else {
                  entry.target.classList.remove('exited-top');
                }
              }
            });
          },
          {
            rootMargin: group.margin,
            threshold: group.threshold
          }
        );
        group.elements.forEach(el => observer.observe(el));
      });

      // 2b. Instanciar observadores de subida (scroll direction 'up')
      upConfigGroups.forEach((group) => {
        const observer = new IntersectionObserver(
          (entries) => {
            if (this.scrollDirection !== 'up') return;
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.remove('exited-top');
              } else {
                entry.target.classList.remove('visible');
                const rect = entry.boundingClientRect;
                if (rect.top < window.innerHeight / 2) {
                  entry.target.classList.add('exited-top');
                } else {
                  entry.target.classList.remove('exited-top');
                }
              }
            });
          },
          {
            rootMargin: group.margin,
            threshold: group.threshold
          }
        );
        group.elements.forEach(el => observer.observe(el));
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

    // Mostrar el botón de música a los 3.5 segundos (cuando empieza a aparecer el Hero)
    setTimeout(() => {
      this.showMusicPlayer = true;
      this.cdr.detectChanges();
    }, 3500);

    // Mostrar las flechas de scroll a los 4 segundos
    setTimeout(() => {
      this.arrowTimerFinished = true;
      this.checkArrowVisibility();
    }, 4000);
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

  constructor(
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore
  ) { }

  private initCountdown(): void {
    // const targetDate = new Date('2026-06-07T00:00:00').getTime();
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
    window.removeEventListener('scroll', this.onScrollBound, true);
    document.removeEventListener('scroll', this.onScrollBound, true);
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
  @HostListener('document:scroll')
  onScroll(): void {
    const currentScrollY = Math.max(
      window.scrollY || 0,
      window.pageYOffset || 0,
      document.documentElement?.scrollTop || 0,
      document.body?.scrollTop || 0
    );
    this.isScrolled = currentScrollY > 30;
    this.checkArrowVisibility();

    if (currentScrollY > this.lastScrollY) {
      this.scrollDirection = 'down';
    } else if (currentScrollY < this.lastScrollY) {
      this.scrollDirection = 'up';
    }
    this.lastScrollY = currentScrollY;
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

  smoothScrollTo(targetY: number, duration: number = 1000): void {
    const startY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const difference = targetY - startY;
    const startTime = performance.now();

    const easeOutCubic = (t: number, b: number, c: number, d: number): number => {
      t /= d;
      t--;
      return c * (t * t * t + 1) + b;
    };

    const performScroll = (y: number) => {
      window.scrollTo(0, y);
      if (document.documentElement) document.documentElement.scrollTop = y;
      if (document.body) document.body.scrollTop = y;
    };

    const step = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      if (timeElapsed < duration) {
        const nextY = easeOutCubic(timeElapsed, startY, difference, duration);
        performScroll(nextY);
        requestAnimationFrame(step);
      } else {
        performScroll(targetY);
      }
    };

    requestAnimationFrame(step);
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;

    const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const y = el.getBoundingClientRect().top + currentScroll - 8;
    this.smoothScrollTo(y, 2000); // 2000ms (2.0 segundos) para un desplazamiento suave y lento
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

  private checkArrowVisibility(): void {
    if (!this.arrowTimerFinished) {
      this.showScrollArrow = false;
      return;
    }

    const windowHeight = window.innerHeight;

    // 1. Ocultar si el footer está en pantalla o a menos de 250px de entrar
    const footerEl = document.getElementById('footer');
    if (footerEl) {
      const footerRect = footerEl.getBoundingClientRect();
      if (footerRect.top <= windowHeight + 250) {
        this.showScrollArrow = false;
        this.cdr.detectChanges();
        return;
      }
    }

    // 2. Ocultar si la última sección (galeria) está terminando en pantalla
    const galeriaEl = document.getElementById('galeria');
    if (galeriaEl) {
      const galeriaRect = galeriaEl.getBoundingClientRect();
      if (galeriaRect.bottom <= windowHeight + 200) {
        this.showScrollArrow = false;
        this.cdr.detectChanges();
        return;
      }
    }

    // 3. Verificación de seguridad por scrollTop / scrollHeight
    const scrollTop = Math.max(
      window.scrollY || 0,
      window.pageYOffset || 0,
      document.documentElement?.scrollTop || 0,
      document.body?.scrollTop || 0
    );
    const scrollHeight = Math.max(
      document.documentElement?.scrollHeight || 0,
      document.body?.scrollHeight || 0
    );

    if (scrollHeight > 0 && (windowHeight + scrollTop >= scrollHeight - 250)) {
      this.showScrollArrow = false;
      this.cdr.detectChanges();
      return;
    }

    // Si no estamos cerca del footer ni del final, mostrar la flecha
    this.showScrollArrow = true;
    this.cdr.detectChanges();
  }

  copyCode(code: string, key: string): void {
    const cleanCode = code.replace(/\s+/g, '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanCode).then(() => {
        this.copiedStates[key] = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.copiedStates[key] = false;
          this.cdr.detectChanges();
        }, 2500);
      }).catch(err => {
        console.error('Error al copiar el código:', err);
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = cleanCode;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        this.copiedStates[key] = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.copiedStates[key] = false;
          this.cdr.detectChanges();
        }, 2500);
      } catch (err) {
        console.error('Fallback: Error al copiar', err);
      }
      document.body.removeChild(textarea);
    }
  }

  scrollToNextSection(): void {
    const sectionIds = ['inicio', 'detalles', 'itinerario', 'ubicacion', 'cuenta-regresiva', 'confirmacion', 'dress-code', 'regalos', 'galeria', 'footer'];
    let targetId: string | null = null;
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Si el elemento está por debajo del viewport actual (con margen de 20px)
        if (rect.top > 20) {
          targetId = id;
          break;
        }
      }
    }

    if (targetId) {
      this.scrollTo(targetId);
      if (targetId === 'footer') {
        this.showScrollArrow = false;
        this.cdr.detectChanges();
      }
    } else {
      // Si no hay más secciones por debajo (ej. ya en el footer), ocultar flecha
      this.showScrollArrow = false;
      this.cdr.detectChanges();
    }
  }
}