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

}
