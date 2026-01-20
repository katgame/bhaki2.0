import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { ComponentCardComponent } from '../../../common/component-card/component-card.component';

@Component({
  selector: 'app-dropzone',
  standalone: true,
  imports: [CommonModule, ComponentCardComponent],
  templateUrl: './dropzone.component.html',
  styles: ``
})
export class DropzoneComponent {
  isDragActive = false;
  previewUrls: string[] = [];

  @Output() filesDropped = new EventEmitter<File[]>();

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const files = Array.from(input.files);
      this.handleFiles(files);
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragActive = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragActive = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragActive = false;
    if (event.dataTransfer && event.dataTransfer.files.length) {
      const files = Array.from(event.dataTransfer.files);
      this.handleFiles(files);
    }
  }

  private handleFiles(files: File[]) {
    const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    const validFiles = files.filter(file => acceptedTypes.includes(file.type));

    // Emit valid files to parent
    this.filesDropped.emit(validFiles);
    console.log('Files dropped:', validFiles);

    // Generate previews
    this.previewUrls = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.previewUrls.push(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removePreview(index: number) {
    this.previewUrls.splice(index, 1);
  }
}
