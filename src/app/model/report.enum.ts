/**
 * Client statuses that the reports reference by `internal_id`. They complete
 * `TypologyEnum.STATUS`, which only declares the ones the forms can pick.
 */
export enum OverdueClientStatusEnum {
  DELETED = 51,
  SUSPENDED = 53,
}

/**
 * Formats offered by the export dropdown on the reports. There is no Excel
 * format: the CSV is UTF-8 with BOM, which Excel opens correctly.
 */
export enum ReportExportFormatEnum {
  CSV = 'csv',
  PDF = 'pdf',
}