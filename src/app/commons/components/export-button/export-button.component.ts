import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';

import { ReportExportFormatEnum } from '../../../model/report.enum';
import { MaterialIconComponent } from '../material-icon/material-icon.component';

/**
 * Dropdown with the export formats of a report.
 *
 * The backend does not expose the download endpoints yet, so every format is
 * rendered as disabled. `exportAction` is already wired: once the endpoints
 * land, drop the `[disabled]` binding and call the service from the page.
 */
@Component({
  selector: 'app-export-button',
  imports: [NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, MaterialIconComponent],
  templateUrl: './export-button.component.html',
  styleUrl: './export-button.component.scss',
})
export class ExportButtonComponent {
  @Input() label: string = 'Exportar';

  @Input() formats: ReportExportFormatEnum[] = [
    ReportExportFormatEnum.CSV,
    ReportExportFormatEnum.EXCEL,
    ReportExportFormatEnum.PDF,
  ];

  @Output() exportAction = new EventEmitter<ReportExportFormatEnum>();

  protected readonly formatLabels: Record<ReportExportFormatEnum, string> = {
    [ReportExportFormatEnum.CSV]: 'CSV',
    [ReportExportFormatEnum.EXCEL]: 'Excel',
    [ReportExportFormatEnum.PDF]: 'PDF',
  };

  onSelect(format: ReportExportFormatEnum): void {
    this.exportAction.emit(format);
  }
}