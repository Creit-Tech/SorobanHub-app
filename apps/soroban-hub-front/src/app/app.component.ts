import { Component, Inject, OnInit, PLATFORM_ID, PlatformRef } from '@angular/core';
import { elfHooks } from '@ngneat/elf';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

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
    @Inject(PLATFORM_ID)
    private readonly platform: PlatformRef,
    @Inject(DOCUMENT)
    private readonly document: Document
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform)) {
      elfHooks.registerPreStoreUpdate((currentState, nextState, storeName) => {
        (this.document.defaultView as any).$$store = {
          ...((this.document.defaultView as any).$$store || {}),
          [storeName]: nextState,
        };

        return nextState;
      });
    }
  }
}
