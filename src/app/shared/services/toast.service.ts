import { Injectable, TemplateRef, ApplicationRef, Injector, createComponent, EmbeddedViewRef, EnvironmentInjector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AlertComponent } from '../components/ui/alert/alert.component';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: any[] = [];

  constructor(private sanitizer: DomSanitizer, private appRef: ApplicationRef, private injector: Injector, private environmentInjector: EnvironmentInjector) {}

  /**
   * Create a transient AlertComponent instance, insert into DOM and auto-remove after duration.
   */
  private showAsAlertComponent(message: string, type: ToastType = 'info', duration: number = 3000) {
    // create component dynamically
    const compRef = createComponent(AlertComponent, { environmentInjector: this.environmentInjector, elementInjector: this.injector });
    // set inputs
    compRef.instance.variant = type;
    compRef.instance.title = ''; // optional: set a title per type if desired
    compRef.instance.message = message;
    // ensure change detection
    compRef.changeDetectorRef.detectChanges();

    // get DOM element and attach to container
    const rootNodes = (compRef.hostView as EmbeddedViewRef<any>).rootNodes;
    if (!rootNodes || !rootNodes.length) {
      // fallback: destroy and bail
      compRef.destroy();
      return;
    }
    const el = rootNodes[0] as HTMLElement;

    let container = document.getElementById('app-alert-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'app-alert-container';
      // minimal container styles — adjust in CSS if you prefer
      container.style.position = 'fixed';
      container.style.top = '1rem';
      container.style.right = '1rem';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '0.75rem';
      document.body.appendChild(container);
    }

    container.appendChild(el);

    // remove after duration
    if (duration > 0) {
      setTimeout(() => {
        try {
          compRef.destroy();
          if (el.parentNode) el.parentNode.removeChild(el);
        } catch (e) {
          console.error('Failed to destroy alert component', e);
        }
      }, duration);
    }
  }

  getToasts() {
    return this.toasts;
  }

  show(message: string, type: ToastType = 'success', duration: number = 3000) {
    const toast = {
      message,
      type,
      duration,
      show: true
    };

    this.toasts.push(toast);

    // also render using AlertComponent for visible UI
    this.showAsAlertComponent(message, type, duration);

    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  success(message: string, duration: number = 5000) {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000) {
    return this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 5000) {
    return this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 5000) {
    return this.show(message, 'info', duration);
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  clear() {
    this.toasts = [];
  }


}
