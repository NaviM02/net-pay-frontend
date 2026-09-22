import { NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { TypologyEnum } from '../../../model/typology.enum';
import { UserRole } from '../../../commons/utils/role.utils';
import { CurrentUserService } from '../../../services/core/current-user.service';

type MenuItem = {
  name: string;
  icon: string;
  path: string;
  /** Roles that can see the entry. Empty means every authenticated user. */
  roles: UserRole[];
};

const ADMIN: UserRole[] = [TypologyEnum.ADMIN];
const COLLECTOR: UserRole[] = [TypologyEnum.COLLECTOR];

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  @Input() active: boolean = true;

  /** Every entry of the app, in menu order. */
  private readonly allItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ADMIN },
    { name: 'Clientes', icon: 'people', path: '/clients', roles: ADMIN },
    { name: 'Servicios', icon: 'business_center', path: '/services', roles: ADMIN },
    { name: 'Pagos', icon: 'payments', path: '/payments', roles: ADMIN },
    { name: 'Recibos', icon: 'receipt_long', path: '/receipts', roles: ADMIN },
    { name: 'Reportes', icon: 'description', path: '/reports', roles: ADMIN },
    { name: 'Auditoría', icon: 'fact_check', path: '/audit', roles: ADMIN },
    { name: 'Usuarios', icon: 'group', path: '/users', roles: ADMIN },
    { name: 'Mi dashboard', icon: 'dashboard', path: '/collector/dashboard', roles: COLLECTOR },
    { name: 'Mis clientes', icon: 'people', path: '/collector/clients', roles: COLLECTOR },
    { name: 'Mis pagos', icon: 'payments', path: '/collector/payments', roles: COLLECTOR },
    { name: 'Mis recibos', icon: 'receipt_long', path: '/collector/receipts', roles: COLLECTOR },
  ];

  /** Only the entries the current role is allowed to open. */
  items: MenuItem[] = [];

  constructor(private currentUserService: CurrentUserService) {}

  ngOnInit(): void {
    const role = this.currentUserService.role as UserRole | undefined;
    this.items = role ? this.allItems.filter(item => item.roles.includes(role)) : [];
  }
}