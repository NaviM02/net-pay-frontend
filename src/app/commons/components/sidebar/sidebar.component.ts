import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type MenuItem = {
  name: string;
  icon: string;
  path: string;
};

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() active: boolean = true;

  items: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: 'dashboard',
      path: '/dashboard',
    },
    {
      name: 'Clientes',
      icon: 'people',
      path: '/clients',
    },
    {
      name: 'Servicios',
      icon: 'business_center',
      path: '/services',
    },
    {
      name: 'Pagos',
      icon: 'payments',
      path: '/payments',
    },
    {
      name: 'Recibos',
      icon: 'receipt_long',
      path: '/receipts',
    },
    {
      name: 'Reportes',
      icon: 'description',
      path: '/reports',
    },
    {
      name: 'Auditoría',
      icon: 'fact_check',
      path: '/audit',
    },
    {
      name: 'Usuarios',
      icon: 'group',
      path: '/users',
    },
  ];
}
