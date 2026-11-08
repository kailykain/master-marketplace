import { Controller } from '@hotwired/stimulus';

/**
 * Закрытие мобильного меню (элемент <details>) по Escape и клику вне.
 */
export default class extends Controller {
    connect() {
        this.onKeydown = (event) => {
            if (event.key === 'Escape') {
                this.element.open = false;
            }
        };
        this.onClickOutside = (event) => {
            if (this.element.open && !this.element.contains(event.target)) {
                this.element.open = false;
            }
        };

        document.addEventListener('keydown', this.onKeydown);
        document.addEventListener('click', this.onClickOutside);
    }

    disconnect() {
        document.removeEventListener('keydown', this.onKeydown);
        document.removeEventListener('click', this.onClickOutside);
    }
}
