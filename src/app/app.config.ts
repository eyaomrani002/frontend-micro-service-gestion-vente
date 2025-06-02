import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
// import { provideNgCharts } from 'ng2-charts';
import { routes } from './app.routes';
import 'chart.js/auto';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
    // NgChartsModule should be imported in your AppModule or relevant feature module
  ]
};
