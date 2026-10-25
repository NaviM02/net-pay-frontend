import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRole, UserRoleAssignment } from '../../../model/access-control.model';
import { DynamicProviderKey } from '../../../model/dynamic-provider-key.enum';
import { AccessControlService } from '../../../services/core/access-control.service';
import { ToastService } from '../../../services/other/toast.service';
import { DynamicSelectComponent } from '../dynamic-select/dynamic-select.component';

@Component({
  selector: 'app-user-roles',
  imports: [DatePipe, FormsModule, DynamicSelectComponent],
  templateUrl: './user-roles.component.html',
  styleUrl: './user-roles.component.scss',
})
export class UserRolesComponent implements OnChanges {
  @Input({ required: true }) userHashId = '';
  @Input() readOnly = false;
  @Input() editable = false;
  @Output() changesChange = new EventEmitter<{
    additions: { role: AppRole; startsAt: string; endsAt: string }[];
    updates: { assignment: UserRoleAssignment; startsAt: string; endsAt: string }[];
    removals: UserRoleAssignment[];
  }>();
  drafts: { role: AppRole | null; startsAt: string; endsAt: string }[] = [];
  persistedRows: { assignment: UserRoleAssignment; startsAt: string; endsAt: string }[] = [];
  removals: UserRoleAssignment[] = [];
  assignments: UserRoleAssignment[] = [];
  loaded = false;
  readonly providerKey = DynamicProviderKey.APP_ROLES_FIND_ALL;

  constructor(
    private accessService: AccessControlService,
    private toastService: ToastService,
  ) {}

  ngOnChanges(): void {
    this.assignments = [];
    this.persistedRows = [];
    this.removals = [];
    this.findAll();
  }

  findAll(): void {
    if (!this.userHashId) {
      this.loaded = this.editable;
      return;
    }
    this.loaded = false;
    this.accessService.assignments(this.userHashId).subscribe({
      next: assignments => {
        this.assignments = assignments;
        this.persistedRows = this.visibleAssignments.map(assignment => ({
          assignment,
          startsAt: this.toLocalDateTime(assignment.startsAt),
          endsAt: assignment.endsAt ? this.toLocalDateTime(assignment.endsAt) : '',
        }));
        this.loaded = true;
        this.emitDrafts();
      },
      error: () => this.toastService.error('No se pudieron cargar los roles del usuario.'),
    });
  }

  get visibleAssignments(): UserRoleAssignment[] {
    const now = Date.now();
    return this.assignments.filter(assignment => !assignment.cancelledAt && (!assignment.endsAt || new Date(assignment.endsAt).getTime() > now));
  }

  addDraft(): void {
    this.drafts.push({ role: null, startsAt: '', endsAt: '' });
    this.emitDrafts();
  }

  removeDraft(index: number): void {
    this.drafts.splice(index, 1);
    this.emitDrafts();
  }

  emitDrafts(): void {
    this.changesChange.emit({
      additions: this.drafts.filter(row => !!row.role).map(row => ({
        role: row.role!, startsAt: row.startsAt, endsAt: row.endsAt,
      })),
      updates: this.persistedRows.filter(row =>
        row.startsAt !== this.toLocalDateTime(row.assignment.startsAt)
        || row.endsAt !== (row.assignment.endsAt ? this.toLocalDateTime(row.assignment.endsAt) : ''),
      ),
      removals: this.removals,
    });
  }

  removePersistedRow(index: number): void {
    const [row] = this.persistedRows.splice(index, 1);
    if (row) this.removals.push(row.assignment);
    this.emitDrafts();
  }

  private toLocalDateTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }
}
