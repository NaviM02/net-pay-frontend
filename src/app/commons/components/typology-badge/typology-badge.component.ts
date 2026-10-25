import { Component, Input } from '@angular/core';
import { AdmTypology } from '../../../model/app.model';
import { getTypologyClass } from '../../utils/typology.utils';
import { TypologyEnum } from '../../../model/typology.enum';

const TYPOLOGY_LABELS: Partial<Record<TypologyEnum, string>> = {
  [TypologyEnum.ACTIVE]: 'Activo',
  [TypologyEnum.INACTIVE]: 'Inactivo',
  [TypologyEnum.LOCKED]: 'Bloqueado',
  [TypologyEnum.RESIDENTIAL]: 'Residencial',
  [TypologyEnum.EMPRESARIAL]: 'Empresarial',
  [TypologyEnum.CORPORATE]: 'Corporativo',
  [TypologyEnum.CASH]: 'Efectivo',
  [TypologyEnum.TRANSFER]: 'Transferencia',
  [TypologyEnum.CAR]: 'Tarjeta',
  [TypologyEnum.COMPLETED]: 'Completado',
  [TypologyEnum.PENDING]: 'Pendiente',
  [TypologyEnum.FAILED]: 'Fallido',
  [TypologyEnum.INFO]: 'Información',
  [TypologyEnum.WARNING]: 'Advertencia',
  [TypologyEnum.ERROR]: 'Error',
};
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

  get label(): string {
    return TYPOLOGY_LABELS[this._typology.internalId as TypologyEnum] ?? this._typology.description;
  }
}
