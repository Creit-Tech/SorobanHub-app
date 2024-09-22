import { Component } from '@angular/core';
import { getRegistry } from '@ngneat/elf';
import { MatListItem, MatListItemIcon, MatListItemLine, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatNavList,
    MatListItem,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatIconButton,
    MatToolbar,
    RouterOutlet,
    MatListItemTitle,
    MatListItemLine,
    MatListItemIcon,
  ],
  template: `
    <mat-toolbar class="relative z-20 col-span-2 bg-white shadow-md">
      <button routerLink="/dashboard" mat-icon-button>
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>Settings</span>

      <span class="w-full"></span>

      <button (click)="nuke()" mat-icon-button>
        <mat-icon>bomb</mat-icon>
      </button>
    </mat-toolbar>

    <div class="flex flex-col bg-[#EEEEEE]">
      <mat-nav-list class="py-0">
        <mat-list-item routerLink="/settings/identities" routerLinkActive="bg-[#DDDDDD]">
          <mat-icon class="mr-[1rem]" matListItemIcon>groups</mat-icon>
          <div matListItemTitle>Identities</div>
          <div matListItemLine>Accounts and Contracts</div>
        </mat-list-item>

        <mat-list-item routerLink="/settings/networks" routerLinkActive="bg-[#DDDDDD]">
          <mat-icon class="mr-[1rem]" matListItemIcon>dns</mat-icon>
          <div matListItemTitle>Networks</div>
          <div matListItemLine>RPCs and passphrases</div>
        </mat-list-item>
      </mat-nav-list>
    </div>

    <div class="col-span-1 overflow-y-auto p-[1rem]">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: `
    :host {
      @apply grid h-screen w-screen overflow-y-hidden;
      grid-template-rows: auto 1fr;
      grid-template-columns: auto 1fr;
    }

    .active-list-item {
      background-color: var(--mdc-list-list-item-hover-state-layer-color);
    }
  `,
})
export class SettingsComponent {
  nuke(): void {
    if (confirm('Are you sure? this will delete EVERYTHING from your app. Confirm if you want to continue.')) {
      getRegistry().forEach(store => store.destroy());
      window.location.reload();
    }
  }
}
