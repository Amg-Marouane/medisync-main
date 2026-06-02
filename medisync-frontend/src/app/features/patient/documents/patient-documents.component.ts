import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpEventType } from '@angular/common/http';
import { DocumentService, MedicalDocumentDto } from '../../../core/services/document.service';

interface UploadItem {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  description: string;
  errorMsg?: string;
}

@Component({
  selector: 'app-patient-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './patient-documents.component.html',
  styleUrl: './patient-documents.component.scss',
})
export class PatientDocumentsComponent implements OnInit {
  private readonly docService = inject(DocumentService);
  private readonly snack = inject(MatSnackBar);

  readonly documents = signal<MedicalDocumentDto[]>([]);
  readonly uploadQueue = signal<UploadItem[]>([]);
  readonly isDragging = signal(false);
  readonly selectedFilter = signal<string>('ALL');
  readonly isLoading = signal(false);

  readonly ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.dcm'];
  readonly MAX_SIZE = 20 * 1024 * 1024; // 20 MB

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading.set(true);
    this.docService.listMyDocuments().subscribe({
      next: (docs) => {
        this.documents.set(docs);
        this.isLoading.set(false);
      },
      error: () => {
        this.snack.open('Erreur lors du chargement des documents', 'Fermer', { duration: 4000 });
        this.isLoading.set(false);
      },
    });
  }

  get filteredDocuments(): MedicalDocumentDto[] {
    const filter = this.selectedFilter();
    if (filter === 'ALL') return this.documents();
    return this.documents().filter((d) => d.documentType === filter);
  }

  // ── Drag & Drop ──────────────────────────────────────────────────────────

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
      input.value = ''; // reset so same file can be re-selected
    }
  }

  private handleFiles(fileList: FileList): void {
    const items: UploadItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = this.getExtension(file.name).toLowerCase();

      if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
        this.snack.open(`Format non autorisé : ${file.name}`, 'Fermer', { duration: 4000 });
        continue;
      }
      if (file.size > this.MAX_SIZE) {
        this.snack.open(`Fichier trop volumineux (max 20 Mo) : ${file.name}`, 'Fermer', { duration: 4000 });
        continue;
      }

      items.push({ file, progress: 0, status: 'pending', description: '' });
    }
    this.uploadQueue.update((q) => [...q, ...items]);
  }

  uploadItem(item: UploadItem): void {
    item.status = 'uploading';
    this.docService.upload(item.file, item.description || undefined).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          item.progress = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
        } else if (event.type === HttpEventType.Response) {
          item.status = 'done';
          item.progress = 100;
          this.loadDocuments();
        }
      },
      error: (err) => {
        item.status = 'error';
        item.errorMsg = err?.error?.message || 'Erreur lors de l\'envoi';
        this.snack.open(`Erreur : ${item.file.name}`, 'Fermer', { duration: 4000 });
      },
    });
  }

  uploadAll(): void {
    const pending = this.uploadQueue().filter((i) => i.status === 'pending');
    pending.forEach((item) => this.uploadItem(item));
  }

  removeFromQueue(item: UploadItem): void {
    this.uploadQueue.update((q) => q.filter((i) => i !== item));
  }

  clearCompleted(): void {
    this.uploadQueue.update((q) => q.filter((i) => i.status !== 'done'));
  }

  // ── Document actions ─────────────────────────────────────────────────────

  downloadDocument(doc: MedicalDocumentDto): void {
    this.docService.download(doc.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.originalName;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snack.open('Erreur de téléchargement', 'Fermer', { duration: 4000 }),
    });
  }

  deleteDocument(doc: MedicalDocumentDto): void {
    if (!confirm(`Supprimer le document "${doc.originalName}" ?`)) return;
    this.docService.delete(doc.id).subscribe({
      next: () => {
        this.documents.update((list) => list.filter((d) => d.id !== doc.id));
        this.snack.open('Document supprimé', 'OK', { duration: 3000 });
      },
      error: () => this.snack.open('Erreur de suppression', 'Fermer', { duration: 4000 }),
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  getExtension(filename: string): string {
    const i = filename.lastIndexOf('.');
    return i >= 0 ? filename.substring(i) : '';
  }

  getIcon(docType: string): string {
    switch (docType) {
      case 'PDF': return 'picture_as_pdf';
      case 'JPG': case 'PNG': return 'image';
      case 'DICOM': return 'biotech';
      default: return 'insert_drive_file';
    }
  }

  getIconColor(docType: string): string {
    switch (docType) {
      case 'PDF': return '#ef4444';
      case 'JPG': return '#f59e0b';
      case 'PNG': return '#3b82f6';
      case 'DICOM': return '#8b5cf6';
      default: return '#6b7280';
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  setFilter(type: string): void {
    this.selectedFilter.set(type);
  }
}
