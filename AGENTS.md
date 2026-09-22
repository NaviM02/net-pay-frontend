# AGENTS.md

Instrucciones técnicas de referencia para trabajar en este frontend (NetPay Manager).

## Contexto del proyecto

- **Stack**: Angular 19 (standalone components, sin NgModules), TypeScript estricto, Angular CLI, Sass (SCSS).
- **Backend**: Spring Boot REST API. `baseUrl` por defecto `http://localhost:8080/api` (configurable en `src/environments/`).
- **Idioma de UI**: textos visibles en español; los mensajes de toast son cadenas hardcodeadas en la mayoría de casos.

## Comandos útiles

```bash
npm start        # ng serve (dev server con hot reload, http://localhost:4200)
npm run build    # build de producción; actúa como verificación de tipos/comprolación
npm run watch    # build de desarrollo con watch
npm test         # pruebas unitarias con Karma/Jasmine (ng test)
```

No hay script de lint configurado. Para validar cambios se usa `npm run build` (compilación estricta + strict templates).

## Arquitectura

### Estructura de carpetas

```
src/
  main.ts                      # bootstrapApplication(App, appConfig)
  environments/                # environment.ts / .dev.ts / .prod.ts (fileReplacements por configuración)
  styles.scss                  # estilos globales + imports de Bootstrap/ng-select
  typings/                     # declaraciones de módulos sobreescritas (cortex-js)
  app/
    app.ts + app.routes.ts + app.config.ts   # raíz del app
    features/
      <feature>/
        pages/<entidad>/       # páginas: <nombre>-list, <nombre>-detail, <nombre>-form-modal
        <feature>.routes.ts   # define `xxxRoutes` y se carga con lazy loading
    commons/                   # código reutilizable (no depende de features)
      components/              # un folder por componente
      decorators/              # decoradores (@confirm, ...)
      utils/                   # helpers puros
    services/
      core/                    # servicios de API (auth, users, tipologías...) -> HTTP
      other/                   # servicios de UI/auxiliares (toast, loading, list-state, ...)
    security/                  # guards + guards de salida
    interceptors/              # interceptores HTTP funcionales
    layout/                    # layouts (admin: header + sidebar + router-outlet)
    model/                     # DTOs, enums, modelos de filtrado
```

### Patrones clave

- **Standalone**: todos los componentes son standalone y declaran sus dependencias en `imports: [...]`. No crear NgModules.
- **Lazy loading**: las rutas de features se cargan con `loadChildren` / `loadComponent`. Cada feature expone `xxxRoutes` en `src/app/features/<feature>/<feature>.routes.ts`.
- **Routing**: `provideRouter(routes, withHashLocation())` (hash location). Las rutas raíz con layout (`AdminComponent`) quedan detrás de `allowNavigationGuard`; las de auth detrás de `allowNavigationOutGuard`.
- **Guards funcionales**: `CanActivateFn` con `inject()` (ver `src/app/security/allow-navigation.guard.ts`).
- **Interceptores funcionales**: `HttpInterceptorFn` registrados con `withInterceptors([...])` en `app.config.ts`. Incluyen `loadingUiInterceptor` (loading global) y `unauthorizedInterceptor`. Se puede omitir el loading por request con `SKIP_GLOBAL_LOADING` del contexto (`src/app/interceptors/loading-ui-context.ts`).
- **Servicios de API**: `@Injectable({ providedIn: 'root' })`, con `private baseUrl = \`${environment.baseUrl}/<recurso>\``, retornan el `Observable` de `HttpClient` directamente (sin manejar suscripción dentro del servicio). Los componentes se suscriben con `{ next, error }` vía `subscribe`.
- **Persistencia**: token (clave `AppStorageKeys.AUTH`) y perfil de usuario (`AppStorageKeys.PROFILE`) viven en `localStorage`. Usar el enum `AppStorageKeys` para cualquier clave nueva; no inventar literales sueltos.
- **Estado de listas / filtros / paginación**: el patrón estándar de listado es `ListStateService` + modelos de `src/app/model/filter.model.ts` (`StringFilter`, `ListFilter`, `DynamicListFilter`, `DateRangeFilter`, `QuickFilter`, `Pagination`, `FilterOrder`) + un archivo `<feature>-list.filter.ts` por lista. El estado de filtros/paginación se persiste en `localStorage` y se traduce a query params (`size`, `offset`, `columnOrder`, `asc`, etc.). No inventar mecanismos paralelos.
- **Layout y diseño**: sistema de diseño propio con prefijo `np-*` (variables CSS `--np-*` en `styles.scss`, clases `.np-btn`, `.np-card`, `.np-input`, badges, tablas, modal, KPI...). Preferir estas clases/componentes comunes antes de estilar desde cero.

## Manejo de dependencias

El repositorio hereda muchas dependencias de la base SIDAL. Esto es lo que se usa **de verdad** hoy y cómo:

| Dependencia | Qué hace / dónde se usa |
| --- | --- |
| `@angular/*` (core, common, router, forms, platform-browser, platform-browser-dynamic, compiler, localize) | Framework Angular 19 standalone. API moderna: `provideRouter`, `provideHttpClient`, `withInterceptors`, `bootstrapApplication`, `loadComponent`. `@angular/localize/init` como polyfill en `angular.json`. |
| `bootstrap` 5.3 | Base de estilos importada **por parciales SCSS** en `src/styles.scss` (functions/variables/mixins y módulos). Para componentes de UI se usa el sistema `np-*`. |
| `@ng-bootstrap/ng-bootstrap` 18 | Componentes de UI de Bootstrap: `NgbModal`/`NgbActiveModal` (confirmaciones en `confirm-action.service`), `NgbDatepicker` (`date-range-picker`), `NgbDropdown`, `NgbToast`. Los módulos se importan directamente en `imports:` del componente. |
| `@ng-select/ng-select` | `<ng-select>` en formularios (`NgSelectComponent`, `NgOptionComponent`) — ver `user-form-modal`. Tema CSS importado en `styles.scss`. El infinite scroll sobre ng-select está planificado (código comentado en `filter-menu`). |
| `@auth0/angular-jwt` | Token JWT. Se configura con `JwtModule.forRoot()` en `app.config.ts` (`tokenGetter` lee `AppStorageKeys.AUTH`, `allowedDomains` = `environment.backendDomain`). `JwtHelperService` se usa para validar expiración en `CurrentUserService`. |
| `@fingerprintjs/fingerprintjs` | Fingerprint del dispositivo; se calcula en `AuthService` y se envía en el login (`fingerprint` en `AuthRequestDto`). |
| `rxjs` | Programación reactiva: `pipe`, `tap`, `switchMap`, `finalize`, `shareReplay`, `of`. No usar `map` para asignar sin retorno claro; preferir `next`/`error` en el subscribe. |
| `@cortex-js/compute-engine` (con `mathlive`) | Motor de cálculo/matemáticas. Requiere el override de tipados en `src/typings/cortex-js.d.ts` y el `paths` en `tsconfig.json`. Uso planificado (módulo de matemáticas/fórmulas). |
| `apexcharts` + `ng-apexcharts` | Gráficas. Instalado; su uso se incorporará en el dashboard/páginas de KPIs. |
| `ngx-quill` + `quill` | Editor de texto enriquecido. Instalado; uso planificado. |
| `ngx-infinite-scroll` | Scroll infinito. Instalado; uso planificado/comentado en `filter-menu`. |
| `@jsverse/transloco` | i18n. Instalado pero **no está configurado** (sin provider en `app.config.ts`); de momento el texto se hardcodea en español. Si se reactiva, registrar el provider y migrar claves. |
| `@popperjs/core` | Dependencia transitiva de ng-bootstrap (dropdowns/popovers). No importar directamente. |

Reglas:

- **No agregar una dependencia al `package.json` para resolver un caso puntual** si ya existe una librería instalada que cubre el caso (p. ej. usar `@ng-bootstrap/ng-bootstrap`, `@ng-select/ng-select` o el sistema `np-*` antes que escribir utilidades nuevas).
- Si se añade una librería nueva detrás de un path especial (como `@cortex-js/compute-engine`), documentarlo en `src/typings/` o `tsconfig.json` y aquí mismo.
- Mantener sincronizados `package.json` y `package-lock.json` (`npm install <lib>` con npm, no editar a mano las versiones en `package.json`).
- No importar desde `node_modules` salvo donde ya se hace (temas de ng-select / parciales de Bootstrap en `styles.scss`).

## Estándares de código

### TypeScript / Angular

- Configuración estricta: `strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch` (`tsconfig.json`) y `strictTemplates` en el angularCompilerOptions. **El código debe compilar limpio con `npm run build`**.
- Componentes standalone con `@Component({ selector: 'app-<nombre>', imports: [...], templateUrl, styleUrl/seStyle })`. En archivos nuevos usar `styleUrl` (singular).
- Preferir propiedades públicas simples y decoradores `@Input()` / `@Output()` con types explícitos. Evitar Signals en componentes (decisión de proyecto: se revirtió a componentes de clase por complejidad).
- Modelos/DTOs: clases con campos `public field!: type;` (ver `src/app/model/app.model.ts`) o interfaces cuando aplique.
- `@Injectable({ providedIn: 'root' })` para servicios; inyección por constructor con `private`, no usar `useClass` salvo necesidad (`CustomDateParserFormatter`).
- Guards e interceptores como funciones (`CanActivateFn`, `HttpInterceptorFn`) con `inject()`.
- Async: suscribirse en el componente con `{ next: ... , error: ... }`. No dejar suscripciones fantasma en servicios. `$` final solo para `Observable`/`Subject` públicos expuestos (p. ej. stream en vuelo).

### Nombrado

- Archivos en kebab-case: `*/*.component.ts|html|scss`, `*.service.ts`, `*.routes.ts`, `*.filter.ts`, `*.guard.ts`, `*.interceptor.ts`, `*.enum.ts`, `*.model.ts`.
- Clase = PascalCase + sufijo del artefacto (`UserListComponent`, `AuthService`, `AdmTypology`).
- Instancias privadas en el constructor: `private http: HttpClient`, `private userService: AppUserService`.
- Constantes en mayúsculas o camelCase según uso (enums en PascalCase con campos en MAYÚSCULAS).
- Selectores HTML: prefijo `app-` (`app-user-list`).
- Normas de editor (`.editorconfig`): indentación 2 espacios, comillas simples, espacio antes de llaves abiertas, `insert_final_newline`, sin trailing whitespace. Respetar el estilo de los archivos vecinos.

### SCSS / Templates

- Estilos por componente en su `*.scss` (scoped). Los estilos globales/reutilizables van en `styles.scss` con el prefijo `np-*` y variables CSS `--np-*`.
- Casi siempre se puede resolver UI con Bootstrap/ng-bootstrap + utility/system `np-*`; escribir CSS nuevo solo si no existe equivalencia.
- HTML: templates tipados (strict templates). Mantener los `@Input()`/`@Output()` con bindings de un solo sentido; eventos con `(click)="handler()"`.

### Manejo de errores y feedback

- Errores durante llamadas HTTP: mostrar `toastService.error(...)` en el `error` del subscribe (mensajes en español). No loguear errores al usuario en `console` salvo diagnóstico temporal.
- Antes de mutar datos destruir/editar/crear, seguir el patrón actual: modal de confirmación (`ConfirmActionService`) y/o toast de éxito/error.

### Git / commits

- Commits convencionales con prefijo de ticket si existe (ejemplos del historial: `NPM-17 #comment feat: add modal... #time 3h`). Formato: `<TICKET> #comment <conventional-type>: <mensaje> #time <horas>`.
- No commitear secretos ni `environment.ts` con credenciales reales. `environment.prod.ts` es para despliegue; las URLs de backend se gestionan ahí.

### Verificación antes de terminar

1. `npm run build` sin errores (vale como typecheck de todo el proyecto).
2. Revisar que no se introdujeron imports muertos ni dependencias sin uso.
3. Si se tocó lógica de listas/parámetros, probar que el patrón `ListStateService`/query params sigue intacto.
