import { provideHttpClient } from "@angular/common/http";
import {
	type ApplicationConfig,
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
import { userReducer } from "./store/store.reducer";

export const appConfig: ApplicationConfig = {
	providers: [
		provideI18Next(),
		provideAppInitializer(() => {
			const i18next = inject(I18NEXT_SERVICE);
			return i18next.init({
				lng: "en",
				fallbackLng: "en",
				resources: {
					en: {
						translation: {
							"Filter users": "Filter users",
							Name: "Name",
						},
					},
					pl: {
						translation: {
							"Filter users": "Filtruj użytkowników",
							Name: "Nazwa użytkownika",
						},
					},
					es: {
						translation: {
							"Filter users": "Filtrar usuarios",
							Name: "Nombre",
						},
					},
				},
			});
		}),
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideHttpClient(),
		provideStore({ user: userReducer }),
		provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
	],
};
