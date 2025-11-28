import { provideHttpClient } from "@angular/common/http";
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { I18NEXT_SERVICE, provideI18Next } from "angular-i18next";
import { routes } from "./app.routes";
import { TRANS } from "./app.trans";

export const appConfig: ApplicationConfig = {
  providers: [
    provideI18Next(),
    provideAppInitializer(() => {
      const i18next = inject(I18NEXT_SERVICE);
      return i18next.init(TRANS);
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
