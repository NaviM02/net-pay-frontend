import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type MenuItem = {
  label: string;
  icon: string;
  path: string;
};

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() open = true;

  @Output() closeSidebar = new EventEmitter<void>();

  items: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/admin/dashboard',
    },
    {
      label: 'Clientes',
      icon: 'people',
      path: '/admin/customers',
    },
    {
      label: 'Planes',
      icon: 'wifi',
      path: '/admin/plans',
    },
    {
      label: 'Pagos',
      icon: 'payments',
      path: '/admin/payments',
    },
    {
      label: 'Recibos',
      icon: 'receipt_long',
      path: '/admin/receipts',
    },
    {
      label: 'Usuarios',
      icon: 'manage_accounts',
      path: '/admin/users',
    },
    {
      label: 'Auditoría',
      icon: 'history',
      path: '/admin/audit',
    },
  ];

  onMenuClick(): void {
    this.closeSidebar.emit();
  }
}
