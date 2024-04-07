import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [
    `
      :host {
        @apply block grid h-screen w-screen;
        grid-template-rows: auto 1fr;
      }
    `,
  ],
})
export class DashboardComponent {}
