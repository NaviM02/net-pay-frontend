import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { getMonthNames, getYearOptions } from '../../utils/report.utils';

export interface Period {
  year: number;
  month: number;
}

/**
 * Month + year selector used by the screens that ask the backend for a single
 * aggregated period (`/dashboard`, `/reports/collections`).
 *
 * @Example
 * ```html
 * <app-period-picker [year]="year" [month]="month" (periodChange)="onPeriodChange($event)" />
 * ```
 */
@Component({
  selector: 'app-period-picker',
  imports: [FormsModule],
  templateUrl: './period-picker.component.html',
  styleUrl: './period-picker.component.scss',
})
export class PeriodPickerComponent {
  @Input() set year(value: number) {
    this._year = value;
  }

  @Input() set month(value: number) {
    this._month = value;
  }

  @Output() periodChange = new EventEmitter<Period>();

  protected readonly months = getMonthNames();
  protected readonly years = getYearOptions();

  protected _year: number = new Date().getFullYear();
  protected _month: number = new Date().getMonth() + 1;

  onMonthChange(month: string): void {
    this._month = Number(month);
    this.emitChange();
  }

  onYearChange(year: string): void {
    this._year = Number(year);
    this.emitChange();
  }

  private emitChange(): void {
    this.periodChange.emit({ year: this._year, month: this._month });
  }
}