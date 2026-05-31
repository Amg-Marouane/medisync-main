import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <header class="ph">
      <div>
        <div class="ph-eyebrow">
          @if (icon) { <mat-icon>{{ icon }}</mat-icon> }
          <span>{{ eyebrow }}</span>
        </div>
        <h1>{{ title }}</h1>
        @if (subtitle) { <p>{{ subtitle }}</p> }
      </div>
      <div class="ph-actions">
        <ng-content></ng-content>
      </div>
    </header>
  `,
  styles: [`
    .ph {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }
    .ph-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #0d6efd;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    p {
      margin: 8px 0 0;
      color: #64748b;
      font-size: 15px;
    }
    .ph-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class PageHeaderComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
}
