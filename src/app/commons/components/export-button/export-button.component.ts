import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';

import { ReportExportFormatEnum } from '../../../model/report.enum';
import { MaterialIconComponent } from '../material-icon/material-icon.component';
import { PermissionDirective } from '../../directives/permission.directive';

/**
 * Dropdown with the export formats of a report. `exportAction` receives the
 * chosen format; the page owns the request and the download.
 */
@Component({
  selector: 'app-export-button',
  imports: [NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, MaterialIconComponent, PermissionDirective],
  templateUrl: './export-button.component.html',
  styleUrl: './export-button.component.scss',
})
export class ExportButtonComponent {
  @Input() label: string = 'Exportar';

  @Input() formats: ReportExportFormatEnum[] = [
    ReportExportFormatEnum.CSV,
    ReportExportFormatEnum.PDF,
  ];

  /** Disables the toggle and shows a busy state while the file is generated. */
  @Input() loading: boolean = false;

  @Output() exportAction = new EventEmitter<ReportExportFormatEnum>();

  protected readonly formatLabels: Record<ReportExportFormatEnum, string> = {
    [ReportExportFormatEnum.CSV]: 'CSV',
    [ReportExportFormatEnum.PDF]: 'PDF',
  };

  onSelect(format: ReportExportFormatEnum): void {
    this.exportAction.emit(format);
  }
}
