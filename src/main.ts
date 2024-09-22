import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { enableElfProdMode } from '@ngneat/elf';
import { devTools } from '@ngneat/elf-devtools';

if (environment.production) {
  enableElfProdMode();
} else {
  devTools({ name: '@SorobanHub' });
}

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
