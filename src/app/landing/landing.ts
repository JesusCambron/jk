import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
})
export class LandingComponent {
  isOpen = signal(false);
  @Output() opened = new EventEmitter<void>();

  toggle() {
    if (this.isOpen()) return;
    this.opened.emit();
    setTimeout(() => {
      this.isOpen.set(true);
    }, 1000);
  }
}
