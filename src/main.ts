import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { carregarRuntimeConfig } from './app/config/runtime-config';

carregarRuntimeConfig()
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err));