import { Controller } from '@hotwired/stimulus';

/**
 * Слайдер на scroll-snap: свайп работает нативно, кнопки и точки — через контроллер.
 */
export default class extends Controller {
    static targets = ['track', 'slide', 'dot'];
    static values = {
        interval: { type: Number, default: 0 }, // авто-прокрутка, мс; 0 — выключена
    };

    connect() {
        this.index = 0;
        this.updateDots();

        if (this.intervalValue > 0) {
            this.start();
            this.element.addEventListener('pointerenter', this.stop = this.stop.bind(this));
            this.element.addEventListener('pointerleave', this.start = this.start.bind(this));
            this.element.addEventListener('focusin', this.stop);
            this.element.addEventListener('focusout', this.start);
        }
    }

    disconnect() {
        clearInterval(this.timer);
    }

    start() {
        clearInterval(this.timer);
        this.timer = setInterval(() => this.show(this.index + 1), this.intervalValue);
    }

    stop() {
        clearInterval(this.timer);
    }

    prev() {
        this.show(this.index - 1);
    }

    next() {
        this.show(this.index + 1);
    }

    go(event) {
        this.show(Number(event.params.index));
    }

    show(index) {
        const count = this.slideTargets.length;
        this.index = ((index % count) + count) % count;

        const slide = this.slideTargets[this.index];
        this.trackTarget.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
        this.updateDots();
    }

    updateDots() {
        this.dotTargets.forEach((dot, i) => {
            const bar = dot.firstElementChild;
            if (!bar) {
                return;
            }

            dot.setAttribute('aria-current', i === this.index ? 'true' : 'false');
            bar.classList.toggle('w-6', i === this.index);
            bar.classList.toggle('bg-surface', i === this.index);
            bar.classList.toggle('w-2', i !== this.index);
            bar.classList.toggle('bg-surface/50', i !== this.index);
        });
    }
}
