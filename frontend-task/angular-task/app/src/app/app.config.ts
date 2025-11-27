import { provideHttpClient } from "@angular/common/http";
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideStore } from "@ngrx/store";
import { provideStoreDevtools } from "@ngrx/store-devtools";
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
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
