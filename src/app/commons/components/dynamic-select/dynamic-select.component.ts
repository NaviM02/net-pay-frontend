import { HttpResponse } from '@angular/common/http';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';
import { ToastService } from '../../../services/other/toast.service';
import { DynamicProviderKey } from '../../../model/dynamic-provider-key.enum';
import { DynamicProviderRegistryService } from '../../../services/other/dynamic-provider-registry.service';

/**
 * Reusable dynamic select with remote search and infinite scroll.
 *
 * Service resolution precedence:
 * 1) {@link DynamicSelectComponent.searchService} when provided
 * 2) Provider resolved by {@link DynamicSelectComponent.providerKey}
 *
 * To reset loaded items after changing filters, pass a NEW `Map` instance to `filters`.
 *
 * @Example
 * ```html
 * <app-dynamic-select
 *   [providerKey]="DynamicProviderKey.SIDAL_SAMPLE_TYPE_FIND_ALL"
 *   [filters]="sampleTypeFilters"
 *   queryParamName="name"
 *   bindLabel="name"
 *   [(ngModel)]="model.sampleType"
 * ></app-dynamic-select>
 * ```
 *
 * ```typescript
 * // Reset dependent options by assigning a new filters object
 * this.methodologyFilters = new Map<string, string>()
 *   .set('essayId', String(this.row.essay.essayId));
 * ```
 */
@Component({
  selector: 'app-dynamic-select',
  imports: [
    NgSelectComponent,
    FormsModule,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective
  ],
  templateUrl: './dynamic-select.component.html',
  styleUrl: './dynamic-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectComponent),
      multi: true
    }
  ]
})
export class DynamicSelectComponent implements OnInit, ControlValueAccessor {

  // CONTROL VALUE ACCESSOR LOGIC:
  private onChange!: (value: any) => void;
  private onTouched!: () => void;

  items: any[] = [];
  innerValue: any;// the internal data model

  offset: number = 0;
  totalItems: number = 0;
  loading: boolean = false;
  params = new Map<string, string>();

  $search = new Subject<string>();

  @Input() notFoundTExt: string = 'Sin resultados';
  @Input() typeToSearchText: string = 'Escribe para buscar';
  @Input() placeholder: string = 'Selecciona una opción';
  @Input() loadingText: string = 'Cargando...';
  @Input() clearable: boolean = false;
  @Input() disabled: boolean = false;

  @Input() size = 10;
  @Input() multiple: boolean = false;
  @Input({ required: true }) bindLabel!: string;
  @Input({ required: true }) queryParamName!: string;
  @Input() providerKey?: DynamicProviderKey | string;
  @Input() allowEmptyProvider: boolean = false;

  /**
   * @Deprecated Use {@link DynamicSelectComponent.providerKey} with the dynamic provider registry.
   * Kept for backward compatibility while migrating existing screens.
   */
  @Input() searchService?: (params: Map<string, string>) => Observable<HttpResponse<any>>;

  // this could be better to avoid multiple calls
  @Input() bindLabelFn!: ((entity: any) => string) | undefined;

  @Input() set filters(filters: Map<string, string>) {
    this.offset = 0;
    this.items = [];
    this.totalItems = 0;
    this.params = new Map<string, string>(filters ?? []);
  }

  constructor(
    private dynamicProviderRegistry: DynamicProviderRegistryService,
    private toastService: ToastService
  ) {
  }

  ngOnInit(): void {
    this.$search
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(searchValue => {
        this.offset = 0;
        this.totalItems = 0;

        if (searchValue) {
          this.params.set(this.queryParamName, searchValue);
        } else {
          this.params.delete(this.queryParamName);
        }

        this.findAll();
      });
  }

  // when the user scrolls to the end of the list
  onScrollEnd() {
    // prevent further calls if all items are loaded
    if (this.items.length >= this.totalItems || this.loading) return;

    this.offset += this.size;
    this.findAll();
  }

  // fetch items from server
  findAll() {
    this.params
      .set('offset', `${this.offset}`)
      .set('size', `${this.size}`);

    const searchService = this.resolveSearchService();
    if (!searchService) return this.toastService.error('msg_error_server');

    this.loading = true;
    searchService(this.params)
      .subscribe({
        next: (response) => {
          if (this.offset === 0) {
            this.items = response.body ?? [];
          } else {
            this.items = this.items.concat(response.body ?? []);
          }

          this.totalItems = Number(response.headers.get('X-Total-Count')) || this.items.length;
        },
        error: _ => this.toastService.error('msg_error_server'),
      })
      .add(() => this.loading = false);
  }

  private resolveSearchService(): ((params: Map<string, string>) => Observable<HttpResponse<any>>) | undefined {
    if (this.searchService) return this.searchService;
    if (this.providerKey) {
      const provider = this.dynamicProviderRegistry.get(this.providerKey);
      if (provider) return provider.searchService;
    }

    // fallback if no provider
    if (this.allowEmptyProvider) return (_: Map<string, string>) => new Observable<HttpResponse<any>>(sub => {
      sub.complete();
    });

    return undefined;
  }

  // when the select is opened
  onOpen() {
    if (this.items.length === 0) this.findAll();
  }

  // get accessor
  get value(): any {
    return this.innerValue;
  }

  // set accessor including call the onchange callback
  set value(val: any) {
    this.innerValue = val;
    if (this.onChange) this.onChange(val);
  }

  // when the input is blurred (loses focus)
  onBlur() {
    if (!this.onTouched) return;
    this.onTouched();
  }

  // write a new value to the element
  writeValue(obj: any): void {
    this.innerValue = obj;
  }

  // register the function to call when the value changes
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // register the function to call when the input is touched
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // no-op for now
  }
}
