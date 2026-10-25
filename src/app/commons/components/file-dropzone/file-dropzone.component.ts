import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-file-dropzone',
  templateUrl: './file-dropzone.component.html',
  styleUrl: './file-dropzone.component.scss',
})
export class FileDropzoneComponent {
  @Input() file: File | null = null;
  @Input() accept = '*/*';
  @Input() disabled = false;
  @Input() prompt = 'Haz clic para elegir o arrastra un archivo aquí';
  @Input() description = '';
  @Output() fileChange = new EventEmitter<File | null>();

  dragActive = false;

  select(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (file) this.fileChange.emit(file);
  }

  openPicker(event: Event, picker: HTMLInputElement): void {
    if (this.disabled) return;
    const target = event.target as HTMLElement;
    if (target.closest('button') || target === picker) return;
    picker.click();
  }

  onKeydown(event: KeyboardEvent, picker: HTMLInputElement): void {
    if (this.disabled || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    picker.click();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled) this.dragActive = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
    if (this.disabled) return;
    const file = event.dataTransfer?.files.item(0) ?? null;
    if (file) this.fileChange.emit(file);
  }

  clear(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) this.fileChange.emit(null);
  }

  get fileSize(): string {
    if (!this.file) return '';
    return this.file.size < 1024 * 1024
      ? `${Math.max(1, Math.round(this.file.size / 1024))} KB`
      : `${(this.file.size / (1024 * 1024)).toFixed(1)} MB`;
  }
}
