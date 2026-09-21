import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDatepickerModule,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { MaterialIconComponent } from '../material-icon/material-icon.component';
import { CustomDateParserFormatter } from '../../../services/other/date-parser-formatter.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-date-range-picker',
  imports: [NgbDatepickerModule, FormsModule, MaterialIconComponent, NgClass],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }],
})
export class DateRangePickerComponent {

  // to show the current date as a reference
  today: NgbDate;

  @Input() disabled = false;
  @Input() allowEmpty = false;
  @Input() txtInvalidFeedback = 'txt_invalid_date';
  @Input() popup = true;

  @Input() set fromDate(value: string | undefined) {
    this.fromModel = value ? this.parseISO(value) : null;
  }

  @Input() set toDate(value: string | undefined) {
    this.toModel = value ? this.parseISO(value) : null;
  }

  @Output() dateRangeChange = new EventEmitter<{ from: string; to: string }>();

  fromModel: NgbDateStruct | null = null;
  toModel: NgbDateStruct | null = null;
  hoveredDate: NgbDate | null = null;

  constructor(
    private calendar: NgbCalendar
  ) {
    this.today = this.calendar.getToday();
  }

  onModelChange(event: NgbDateStruct, isFrom: boolean) {
    if (isFrom) {
      let ngbDate = NgbDate.from(this.fromModel);
      if (!this.calendar.isValid(ngbDate)) return this.dateRangeChange.emit({ from: '', to: '' });
    } else {
      let ngbDate = NgbDate.from(this.toModel);
      if (!this.calendar.isValid(ngbDate)) return this.dateRangeChange.emit({ from: '', to: '' });
    }
    this.emitISO();
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromModel && !this.toModel) {
      this.fromModel = date;
    } else if (this.fromModel && !this.toModel && date.after(this.fromModel)) {
      this.toModel = date;
    } else {
      this.toModel = null;
      this.fromModel = date;
    }
    this.emitISO();
  }

  emitISO() {
    if (!this.fromModel || !this.toModel) return;

    const fromNgb = NgbDate.from(this.fromModel);
    const toNgb = NgbDate.from(this.toModel);

    const fromIso = this.toISOString(fromNgb, false);
    const toIso = this.toISOString(toNgb, true);
    this.dateRangeChange.emit({ from: fromIso, to: toIso });
  }

  private parseISO(dateStr?: string): NgbDate | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return new NgbDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }

  private toISOString(ngbDate: NgbDate | null, endOfDay = false): string {
    if (!ngbDate) return '';
    const tmpDate = new Date();
    tmpDate.setFullYear(ngbDate.year, ngbDate.month - 1, ngbDate.day);
    tmpDate.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
    return tmpDate.toISOString();
  }

  isHovered(date: NgbDate) {
    return (this.fromModel && !this.toModel && this.hoveredDate && date.after(this.fromModel) && date.before(this.hoveredDate));
  }

  isInside(date: NgbDate) {
    return this.toModel && this.fromModel && date.after(this.fromModel) && date.before(this.toModel);
  }

  isRange(date: NgbDate) {
    return ((this.fromModel && date.equals(this.fromModel)) || (this.toModel && date.equals(this.toModel)) || this.isInside(date) || this.isHovered(date));
  }
}
