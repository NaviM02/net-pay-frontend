/**
 * Client statuses that the reports reference by `internal_id`. They complete
 * `TypologyEnum.STATUS`, which only declares the ones the forms can pick.
 */
export enum OverdueClientStatusEnum {
  DELETED = 51,
  SUSPENDED = 53,
}

/** Formats offered by the export dropdown on the reports. */
export enum ReportExportFormatEnum {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
}