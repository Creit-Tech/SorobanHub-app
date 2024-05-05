import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styles: [
    `
      :host {
        @apply grid h-screen w-screen overflow-y-hidden;
        grid-template-rows: auto 1fr;
        grid-template-columns: auto 1fr;
      }

      .active-list-item {
        background-color: var(--mdc-list-list-item-hover-state-layer-color);
      }
    `,
  ],
})
export class SettingsComponent {
  nuke(): void {
    if (confirm('Are you sure? this will delete EVERYTHING from your app. Confirm if you want to continue.')) {
      window.ipcAPI.invoke({ route: 'settings/nuke', msg: undefined }).then();
    }
  }
}
