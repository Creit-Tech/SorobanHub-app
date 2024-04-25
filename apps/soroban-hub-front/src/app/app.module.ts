import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSidenavModule } from '@angular/material/sidenav';
import { environment } from '../environments/environment';
import { AppMenuService } from './core/services/app-menu/app-menu.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, MatSidenavModule],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    {
      provide: 'env',
      useValue: environment,
    },
    AppMenuService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
