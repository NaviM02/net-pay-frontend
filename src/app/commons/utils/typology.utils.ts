import { AdmTypology } from '../../model/app.model';
import { TypologyEnum } from '../../model/typology.enum';

export function compareTps(tp1: AdmTypology | undefined, tp2: AdmTypology | undefined): boolean {
  return !!tp1 && !!tp2 && tp1.internalId === tp2.internalId;
}

const TYPOLOGY_CLASS_BY_INTERNAL_ID: Partial<Record<TypologyEnum, string>> = {
  [TypologyEnum.ACTIVE]: 'text-white bg-success',
  [TypologyEnum.INACTIVE]: 'text-dark bg-gray',
  [TypologyEnum.LOCKED]: 'text-white bg-primary'
};

/**
 * Determines the CSS class for a given typology based on the provided internal ID.
 * Avoid using this directly in an HTML template.
 *
 */
export function getTypologyClass(internalId: number | null | undefined): string {
  if (internalId === null || internalId === undefined) {
    return 'text-dark bg-light';
  }

  return TYPOLOGY_CLASS_BY_INTERNAL_ID[internalId as TypologyEnum] ?? 'text-dark bg-light';
}
