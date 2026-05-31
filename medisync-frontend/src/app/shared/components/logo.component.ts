import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      [attr.aria-label]="'MediSync logo'"
      role="img"
    >
      @if (gradient) {
        <defs>
          <linearGradient id="medisync-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0D6EFD" />
            <stop offset="55%" stop-color="#06B6D4" />
            <stop offset="100%" stop-color="#10B981" />
          </linearGradient>
        </defs>
      }

      <g
        [attr.fill]="gradient ? 'url(#medisync-logo-grad)' : 'currentColor'"
        [attr.stroke]="gradient ? 'url(#medisync-logo-grad)' : 'currentColor'"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- Top ball -->
        <circle cx="50" cy="14" r="3.5" />

        <!-- Central staff -->
        <line x1="50" y1="17" x2="50" y2="92" />

        <!-- Wings - left side -->
        <path
          d="M50 32 Q40 24 28 22 Q34 28 40 30 Q28 28 18 30 Q30 34 40 33 Q28 35 20 39 Q32 41 41 37"
          fill="none"
        />

        <!-- Wings - right side -->
        <path
          d="M50 32 Q60 24 72 22 Q66 28 60 30 Q72 28 82 30 Q70 34 60 33 Q72 35 80 39 Q68 41 59 37"
          fill="none"
        />

        <!-- Snake left -->
        <path
          d="M50 44 C40 47 40 54 50 57 C60 60 60 67 50 70 C42 72 42 78 50 80"
          fill="none"
        />

        <!-- Snake right -->
        <path
          d="M50 44 C60 47 60 54 50 57 C40 60 40 67 50 70 C58 72 58 78 50 80"
          fill="none"
        />

        <!-- Snake heads -->
        <circle cx="46" cy="44" r="2" />
        <circle cx="54" cy="44" r="2" />

        <!-- Base ornament -->
        <path
          d="M44 88 Q50 92 56 88"
          fill="none"
        />
      </g>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
  `]
})
export class LogoComponent {
  @Input() size = 32;
  @Input() gradient = false;
}
