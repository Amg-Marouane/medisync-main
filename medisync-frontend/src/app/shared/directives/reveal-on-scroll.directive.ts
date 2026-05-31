import {
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  @Input() revealDelay = 0;

  ngOnInit(): void {
    const node = this.el.nativeElement;
    node.classList.add('reveal');
    if (this.revealDelay) {
      node.style.transitionDelay = `${this.revealDelay}ms`;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
