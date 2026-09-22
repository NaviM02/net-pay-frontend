import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { DynamicListProvider } from '../../model/filter.model';

export const DYNAMIC_LIST_PROVIDERS = new InjectionToken<DynamicListProvider[]>('DYNAMIC_LIST_PROVIDERS');

export abstract class DynamicListProviderRegistry {
  abstract has(key: string): boolean;

  abstract get(key: string): DynamicListProvider | undefined;

  abstract getOrThrow(key: string): DynamicListProvider;

  abstract register(provider: DynamicListProvider): void;
}

/**
 * A service that manages the registry of dynamic list providers. The `DynamicProviderRegistryService`
 * allows registering, retrieving, and checking for the existence of providers that can offer
 * dynamic lists based on specific keys. It forms the backbone for dynamically collecting data
 * via registered providers.
 *
 * Mainly used by {@link DynamicSelectComponent}, {@link FilterMenuComponent} and {@link DynamicListFilter},
 * to fetch the appropriate provider based on the input key and retrieve, and
 */
@Injectable({
  providedIn: 'root'
})
export class DynamicProviderRegistryService implements DynamicListProviderRegistry {

  private providers = new Map<string, DynamicListProvider>();

  constructor(
    @Optional() @Inject(DYNAMIC_LIST_PROVIDERS) providers: DynamicListProvider[] = [],
  ) {
    providers.forEach(provider => this.register(provider));
  }

  has(key: string): boolean {
    return this.providers.has(key);
  }

  get(key: string): DynamicListProvider | undefined {
    return this.providers.get(key);
  }

  getOrThrow(key: string): DynamicListProvider {
    const provider = this.providers.get(key);
    if (provider) return provider;
    throw new Error(`DynamicList provider not found for key: ${key}`);
  }

  register(provider: DynamicListProvider): void {
    this.providers.set(provider.key, provider);
  }
}
