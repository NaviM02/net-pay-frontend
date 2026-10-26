import { DestroyRef, Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccessControlService } from '../../services/core/access-control.service';

@Directive({ selector: '[appPermission]' })
export class PermissionDirective {
  private required: string | string[] = [];
  private visible = false;

  @Input() set appPermission(value: string | string[]) {
    this.required = value;
    this.update();
  }

  constructor(
    private template: TemplateRef<unknown>,
    private container: ViewContainerRef,
    private accessService: AccessControlService,
    destroyRef: DestroyRef,
  ) {
    this.accessService.access$.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => this.update());
  }

  private update(): void {
    const allowed = this.accessService.hasAnyPermission(this.required);
    if (allowed === this.visible) return;
    this.visible = allowed;
    this.container.clear();
    if (allowed) this.container.createEmbeddedView(this.template);
  }
}
