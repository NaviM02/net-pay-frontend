import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { ImportResource, ImportResult, ImportRowResult } from '../../../model/data-import.model';
import { DataImportService } from '../../../services/core/data-import.service';
import { ToastService } from '../../../services/other/toast.service';

@Component({
  selector: 'app-data-import',
  imports: [FormsModule],
  templateUrl: './data-import.component.html',
  styleUrl: './data-import.component.scss',
})
export class DataImportComponent {
  @Input() resource: ImportResource = 'clients';
  @Output() imported = new EventEmitter<void>();

  file: File | null = null;
  delimiter = ',';
  busy = false;
  result: ImportResult | null = null;
  errors: ImportRowResult[] = [];
  errorMessage = '';
  visibleErrors = 100;

  readonly resourceNames: Record<ImportResource, string> = {
    clients: 'clientes',
    services: 'servicios',
    users: 'usuarios',
    payments: 'pagos',
  };

  constructor(
    private modalService: NgbModal,
    private importService: DataImportService,
    private toastService: ToastService,
  ) {}

  open(content: TemplateRef<unknown>): void {
    this.file = null;
    this.delimiter = ',';
    this.resetResult();
    this.modalService.open(content, {
      size: 'lg',
      centered: true,
      scrollable: true,
      ariaLabelledBy: 'data-import-title',
      beforeDismiss: () => !this.busy,
    });
  }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
    this.resetResult();

    if (this.file && !this.file.name.toLowerCase().endsWith('.csv')) {
      this.errorMessage = 'Selecciona un archivo con extensión .csv.';
    } else if (this.file && this.file.size === 0) {
      this.errorMessage = 'El archivo está vacío.';
    } else if (this.file && this.file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'El archivo no puede superar los 5 MB.';
    }

    if (this.errorMessage) {
      this.file = null;
      input.value = '';
    }
  }

  resetResult(): void {
    this.result = null;
    this.errors = [];
    this.errorMessage = '';
    this.visibleErrors = 100;
  }

  upload(dryRun: boolean): void {
    if (!this.file || this.busy || (this.result && !this.result.dryRun)) return;

    this.resetResult();
    this.busy = true;
    this.importService.upload(this.resource, this.file, dryRun, this.delimiter)
      .pipe(finalize(() => this.busy = false))
      .subscribe({
        next: result => {
          this.result = result;
          this.errors = result.rows.filter(row => row.status === 'ERROR');
          if (!result.dryRun && result.successful > 0) {
            this.imported.emit();
            this.toastService.success(`Se importaron ${result.successful} registros correctamente.`);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.status === 413
            ? 'El archivo no puede superar los 5 MB.'
            : this.describeError(typeof error.error === 'string' ? error.error : null);
          this.toastService.error(this.errorMessage);
        },
      });
  }

  get templateUrl(): string {
    const columns: Record<ImportResource, string[]> = {
      services: ['name', 'speed', 'monthlyPrice', 'type', 'status'],
      clients: ['businessName', 'contactName', 'contactEmail', 'contactPhone', 'address', 'latitude',
        'longitude', 'customerSince', 'serviceName', 'collectorHashId', 'collectorName', 'collectorEmail', 'status'],
      users: ['fullName', 'email', 'password', 'role', 'status'],
      payments: ['importKey', 'clientName', 'clientEmail', 'clientPhone', 'collectorName', 'collectorEmail',
        'amount', 'paidAt', 'method', 'status', 'reference', 'comment'],
    };
    return `data:text/csv;charset=utf-8,${encodeURIComponent('\uFEFF' + columns[this.resource].join(this.delimiter) + '\r\n')}`;
  }

  describeError(code: string | null): string {
    const messages: Record<string, string> = {
      import_empty_file: 'El archivo no contiene registros.',
      import_file_too_large: 'El archivo no puede superar los 5 MB.',
      import_unsupported_format: 'El formato del archivo no es compatible.',
      import_invalid_file: 'No se pudo leer el archivo. Revisa su formato y usa codificación UTF-8.',
      import_file_read_error: 'No se pudo leer el archivo.',
      import_invalid_request: 'No se pudo procesar la solicitud de importación.',
      import_unknown_resource: 'El tipo de importación no es válido.',
      import_invalid_delimiter: 'El separador debe ser coma, punto y coma o tabulación.',
      import_unknown_columns: 'Hay columnas desconocidas. Usa los encabezados de la plantilla y revisa el separador.',
      import_header_required: 'El archivo debe incluir una fila de encabezados.',
      import_invalid_or_duplicate_headers: 'Los encabezados están vacíos o repetidos.',
      import_too_many_columns: 'El archivo supera el límite de 30 columnas.',
      import_row_limit_exceeded: 'El archivo supera el límite de 5000 registros.',
      import_duplicate_service_in_file: 'El nombre del plan está repetido en el archivo.',
      import_duplicate_user_in_file: 'El correo del usuario está repetido en el archivo.',
      import_duplicate_payment_in_file: 'La clave importKey del pago está repetida en el archivo.',
      import_user_email_already_exists: 'Ya existe un usuario con este correo electrónico.',
      import_payment_already_imported: 'Ya se importó un pago con esta clave importKey.',
      import_password_too_long: 'La contraseña supera el máximo de 72 bytes en UTF-8.',
      import_role_invalid: 'El rol debe ser ADMINISTRATOR (61) o COLLECTOR (62).',
      import_method_invalid: 'El método debe ser CASH (81), TRANSFER (82) o CARD (83).',
      import_client_reference_required: 'Indica al menos clientName, clientEmail o clientPhone para identificar al cliente.',
      import_client_not_found: 'No existe un cliente que coincida con los datos indicados.',
      import_client_ambiguous: 'Los datos coinciden con varios clientes. Agrega correo o teléfono para identificar uno solo.',
      import_service_not_found: 'El plan indicado en serviceName no existe.',
      import_collector_not_found: 'No existe un cobrador que coincida con los datos indicados.',
      import_collector_ambiguous: 'Los datos coinciden con varios cobradores. Agrega el correo para identificar uno solo.',
      import_collector_reference_conflict: 'Usa collectorHashId o los datos collectorName/collectorEmail, sin combinarlos.',
      import_collector_role_invalid: 'El usuario indicado no tiene el rol de cobrador.',
      import_collector_inactive: 'El cobrador indicado no está activo.',
      import_constraint_violation: 'El registro incumple una restricción de datos o está duplicado.',
      service_name_must_be_unique: 'Ya existe un plan con este nombre.',
      import_type_invalid: 'El tipo debe ser un identificador válido de tipo de servicio.',
      import_status_invalid: this.resource === 'payments'
        ? 'El estado debe ser COMPLETED (91), PENDING (92) o FAILED (93).'
        : 'El estado debe ser ACTIVE (49), INACTIVE (50), LOCKED (52) o SUSPENDED (53).',
      import_contactEmail_invalid: 'El correo electrónico no es válido.',
      import_email_invalid: 'El correo electrónico del usuario no es válido.',
      import_clientEmail_invalid: 'El correo electrónico del cliente no es válido.',
      import_collectorEmail_invalid: 'El correo electrónico del cobrador no es válido.',
      import_customerSince_invalid_date: 'La fecha debe tener formato AAAA-MM-DD.',
      import_paidAt_invalid_date: 'La fecha del pago debe tener formato AAAA-MM-DD.',
    };
    if (code && messages[code]) return messages[code];
    const columnCount = code?.match(/^import_column_count_row_(\d+)$/);
    if (columnCount) return `La fila ${columnCount[1]} tiene un número de columnas distinto al encabezado.`;
    const fieldError = code?.match(/^import_(\w+)_(required|too_long|invalid_number)$/);
    if (fieldError) {
      const descriptions: Record<string, string> = {
        required: 'es obligatorio',
        too_long: 'supera la longitud máxima permitida',
        invalid_number: 'debe ser un número dentro del rango y la precisión permitidos',
      };
      return `El campo ${fieldError[1]} ${descriptions[fieldError[2]]}.`;
    }
    return code
      ? `No se pudo procesar el registro o archivo (${code}).`
      : 'No se pudo completar la importación. Revisa la conexión e inténtalo de nuevo.';
  }
}
