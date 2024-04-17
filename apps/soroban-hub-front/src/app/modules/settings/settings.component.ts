import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styles: [
    `
      :host {
        @apply block grid h-screen w-screen;
        grid-template-rows: auto 1fr;
        grid-template-columns: auto 1fr;
      }

      .active-list-item {
        background-color: var(--mdc-list-list-item-hover-state-layer-color);
      }
    `,
  ],
})
export class SettingsComponent {}
