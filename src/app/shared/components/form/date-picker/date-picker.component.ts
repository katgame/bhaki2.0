import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnChanges, SimpleChanges, AfterViewInit, OnDestroy } from '@angular/core';
import flatpickr from 'flatpickr';
import { LabelComponent } from '../label/label.component';
import "flatpickr/dist/flatpickr.css";

@Component({
  selector: 'app-date-picker',
  imports: [CommonModule,LabelComponent],
  templateUrl: './date-picker.component.html',
  styles: ``
})
export class DatePickerComponent implements OnChanges, AfterViewInit, OnDestroy {

  @Input() id!: string;
  @Input() mode: 'single' | 'multiple' | 'range' | 'time' = 'single';
  @Input() defaultDate?: string | Date | string[] | Date[];
  @Input() label?: string;
  @Input() placeholder?: string;
  @Output() dateChange = new EventEmitter<any>();

  @ViewChild('dateInput', { static: false }) dateInput!: ElementRef<HTMLInputElement>;

  private flatpickrInstance: flatpickr.Instance | undefined;
  private isInitialized = false;

  ngAfterViewInit() {
    this.initializeFlatpickr();
    // Set the date after initialization if defaultDate is already set
    setTimeout(() => {
      if (this.defaultDate && this.flatpickrInstance) {
        this.flatpickrInstance.setDate(this.defaultDate, false);
      }
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['defaultDate']) {
      if (this.isInitialized && this.flatpickrInstance) {
        if (this.defaultDate) {
          this.flatpickrInstance.setDate(this.defaultDate, false);
        } else {
          this.flatpickrInstance.clear();
        }
      }
    }
  }

  private initializeFlatpickr() {
    if (this.dateInput?.nativeElement) {
      // Detect mobile devices - on mobile, use native date picker or simpler flatpickr config
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      
      // Base configuration that works on all devices
      const config: any = {
        mode: this.mode,
        allowInput: false, // Prevent manual typing to ensure format consistency
        dateFormat: 'Y-m-d', // Value format: yyyy-mm-dd (for form submission/API)
        defaultDate: this.defaultDate,
        onChange: (selectedDates: Date[], dateStr: string, instance: flatpickr.Instance) => {
          // dateStr is in Y-m-d format (yyyy-mm-dd) for API submission
          // Emit both the string format and the Date object for flexibility
          this.dateChange.emit({ 
            selectedDates, 
            dateStr, 
            instance,
            date: selectedDates.length > 0 ? selectedDates[0] : null
          });
        }
      };

      if (isMobile) {
        // Mobile-specific configuration - simpler, more reliable
        config.disableMobile = false; // Use flatpickr on mobile (don't fall back to native)
        config.static = false; // Use popup on mobile instead of inline
        config.monthSelectorType = 'dropdown'; // Better for mobile
      } else {
        // Desktop configuration
        config.static = true;
        config.monthSelectorType = 'static';
        // Use altInput on desktop to show yyyy/mm/dd format
        config.altFormat = 'Y/m/d'; // Display format: yyyy/mm/dd (shown to user in input field)
        config.altInput = true; // Use altInput to show altFormat consistently
        config.altInputClass = 'h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800';
      }
      
      // Add locale configuration
      config.locale = {
        firstDayOfWeek: 1
      };
      
      this.flatpickrInstance = flatpickr(this.dateInput.nativeElement, config);
      this.isInitialized = true;
    }
  }

  ngOnDestroy() {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }
}
