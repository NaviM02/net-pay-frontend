import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../commons/components/header/header.component';
import { SidebarComponent } from '../../commons/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  sidebarStatus: boolean = true;

  constructor() {
  }
}
