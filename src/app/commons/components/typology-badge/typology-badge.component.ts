import { Component, Input } from '@angular/core';
import { AdmTypology } from '../../../model/app.model';
import { getTypologyClass } from '../../utils/typology.utils';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-typology-badge',
  templateUrl: './typology-badge.component.html',
  styleUrls: ['./typology-badge.component.scss'],
  imports: [NgClass],
})
export class TypologyBadgeComponent {
  @Input() set typology(value: AdmTypology) {
    if (!value) return;
    this._typology = value;
    this.clazz = getTypologyClass(value.internalId);
  }

  _typology!: AdmTypology;
  clazz: string = 'text-dark bg-light';
}
