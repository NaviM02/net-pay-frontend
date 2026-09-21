import { Component, OnInit } from '@angular/core';
import { UserListFilter } from './user-list.filter';
import { AppUser } from '../../../../../model/app.model';
import { AppUserService } from '../../../../../services/core/app-user.service';
import { Pagination } from '../../../../../model/filter.model';
import { ListStateService } from '../../../../../services/other/list-state.service';
import { ListPageHeaderComponent } from '../../../../../commons/components/list-page-header/list-page-header.component';
import { FilterMenuComponent } from '../../../../../commons/components/filter-menu/filter-menu.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';
import { TableRowActionComponent } from '../../../../../commons/components/table-row-action/table-row-action.component';
import { PaginationComponent } from '../../../../../commons/components/pagination/pagination.component';
import { ToastService } from '../../../../../services/other/toast.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [
    ListPageHeaderComponent,
    FilterMenuComponent,
    TypologyBadgeComponent,
    TableRowActionComponent,
    PaginationComponent,
  ],
})
export class UserListComponent implements OnInit {
  users: AppUser[] = [];

  constructor(
    private userService: AppUserService,
    private toastService: ToastService,
    protected listStateService: ListStateService,
  ) {
    this.listStateService.init(UserListFilter, new Pagination('user-list-pagination'), () =>
      this.findAll(),
    );
  }

  ngOnInit(): void {
    this.findAll();
  }

  findAll(): void {
    this.userService.findAll(this.listStateService.queryParams).subscribe({
      next: (response) => {
        this.users = response.body ?? [];
        const total = Number(response.headers.get('X-Total-Count')) || this.users.length;
        this.listStateService.updatePagination(total, this.users.length);
      },
      error: () => this.toastService.error('msg_error_server'),
    });
  }

  delete(hashId: string): void {}
}
