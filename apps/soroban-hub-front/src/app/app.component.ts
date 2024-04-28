import { Component, Inject, OnInit, PLATFORM_ID, PlatformRef } from '@angular/core';
import { elfHooks } from '@ngneat/elf';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AppMenuService } from './core/services/app-menu/app-menu.service';
import { MatIconRegistry } from '@angular/material/icon';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  template: `
    <main class="h-screen w-screen">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent implements OnInit {
  constructor(
    @Inject('env')
    private readonly env: typeof environment,
    @Inject(PLATFORM_ID)
    private readonly platform: PlatformRef,
    @Inject(DOCUMENT)
    private readonly document: Document,
    private readonly appMenuService: AppMenuService,
    private matIconReg: MatIconRegistry
  ) {}

  ngOnInit(): void {
    this.matIconReg.setDefaultFontSetClass('material-symbols-rounded');

    if (isPlatformBrowser(this.platform)) {
      if (!this.env.production) {
        elfHooks.registerPreStoreUpdate((currentState, nextState, storeName) => {
          (this.document.defaultView as any).$$store = {
            ...((this.document.defaultView as any).$$store || {}),
            [storeName]: nextState,
          };

          return nextState;
        });
      }

      this.appMenuService.startListeners();
    }
  }
}
