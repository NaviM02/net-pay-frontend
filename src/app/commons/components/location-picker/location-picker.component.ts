import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as L from 'leaflet';

import { buildSkipGlobalLoadingContext } from '../../../interceptors/loading-ui-context';
import { ToastService } from '../../../services/other/toast.service';
import { MaterialIconComponent } from '../material-icon/material-icon.component';

export interface MapLocation {
  latitude: number | null;
  longitude: number | null;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimReverseResult {
  display_name?: string;
}

// Pabella, Paxtocá, Totonicapán, Guatemala (service area default).
const DEFAULT_CENTER: [number, number] = [14.8774165, -91.4309263];
const DEFAULT_ZOOM = 14;
const MARKER_ZOOM = 16;

/**
 * Location picker backed by Leaflet + OpenStreetMap.
 *
 * Implements `ControlValueAccessor` so it can be bound with `[(ngModel)]` to a
 * {@link MapLocation}. Selecting a point (map click, address search or browser
 * geolocation) emits the resolved address through {@link LocationPickerComponent.addressResolved}
 * so the parent can autofill its own address field.
 *
 * @example
 * ```html
 * <app-location-picker
 *   [(ngModel)]="location"
 *   (addressResolved)="client.address = $event"
 * ></app-location-picker>
 * ```
 */
@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.scss',
  imports: [FormsModule, MaterialIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationPickerComponent),
      multi: true,
    },
  ],
})
export class LocationPickerComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() placeholder: string = 'Busca una dirección (calle, zona, municipio...)';
  @Input() height: number = 420;

  /** When true the map is display only: no search, no click-to-select. */
  @Input() readonly: boolean = false;

  /** Emits the human readable address resolved from the selected location. */
  @Output() addressResolved = new EventEmitter<string>();

  /** Emits an empty string when the selection is cleared, so the parent can reset its address. */
  @Output() addressCleared = new EventEmitter<string>();

  @ViewChild('mapContainer') private mapContainer!: ElementRef<HTMLDivElement>;

  searchTerm: string = '';
  searching: boolean = false;
  disabled: boolean = false;

  value: MapLocation = { latitude: null, longitude: null };

  private map?: L.Map;
  private marker?: L.Marker;
  private onChange: (value: MapLocation) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.hasCoords(this.value)
        ? [this.value.latitude, this.value.longitude]
        : DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      if (this.readonly) return;
      this.setLocation(event.latlng.lat, event.latlng.lng, true);
    });

    if (this.hasCoords(this.value)) {
      this.setMarker(this.value.latitude, this.value.longitude);
    } else if (!this.readonly) {
      this.centerOnUserLocation();
    }

    // The map is created after the container is rendered; make sure Leaflet
    // measures the final size once the layout settles.
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  get hasValue(): boolean {
    return this.hasCoords(this.value);
  }

  search(): void {
    const query = this.searchTerm.trim();
    if (!query) return;

    this.searching = true;
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1` +
      `&q=${encodeURIComponent(query)}`;

    this.http
      .get<NominatimSearchResult[]>(url, { context: buildSkipGlobalLoadingContext() })
      .subscribe({
        next: (results) => {
          const result = results[0];
          if (!result) {
            this.toastService.warning('No se encontró la dirección indicada.');
            return;
          }

          const latitude = Number(result.lat);
          const longitude = Number(result.lon);
          this.setLocation(latitude, longitude, false);
          this.map?.setView([latitude, longitude], MARKER_ZOOM);
          this.addressResolved.emit(result.display_name);
        },
        error: () => this.toastService.error('No se pudo buscar la dirección.'),
      })
      .add(() => (this.searching = false));
  }

  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.toastService.error('Tu navegador no soporta geolocalización.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.setLocation(latitude, longitude, true);
        this.map?.setView([latitude, longitude], MARKER_ZOOM);
      },
      () => this.toastService.error('No se pudo obtener tu ubicación.'),
    );
  }

  clear(): void {
    this.marker?.remove();
    this.marker = undefined;
    this.value = { latitude: null, longitude: null };
    this.onChange(this.value);
    this.addressCleared.emit('');
  }

  /**
   * Moves the map to the user's current location when the browser allows it.
   * Only centers the view: it never selects a point, so it never writes a value.
   * Falls back silently to {@link DEFAULT_CENTER} when denied or unavailable.
   */
  private centerOnUserLocation(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.map?.setView([latitude, longitude], DEFAULT_ZOOM);
      },
      () => {},
      { timeout: 5000 },
    );
  }

  private setLocation(latitude: number, longitude: number, reverse: boolean): void {
    this.value = { latitude, longitude };
    this.onChange(this.value);
    this.setMarker(latitude, longitude);

    if (reverse) {
      this.reverseGeocode(latitude, longitude);
    }
  }

  private setMarker(latitude: number, longitude: number): void {
    if (!this.map) return;

    const icon = L.divIcon({
      className: 'np-map-div-icon',
      html: '<span class="np-map-marker"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 22],
    });

    if (this.marker) {
      this.marker.setLatLng([latitude, longitude]);
      this.marker.setIcon(icon);
      return;
    }

    this.marker = L.marker([latitude, longitude], { icon }).addTo(this.map);
  }

  private reverseGeocode(latitude: number, longitude: number): void {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${latitude}&lon=${longitude}`;

    this.http
      .get<NominatimReverseResult>(url, { context: buildSkipGlobalLoadingContext() })
      .subscribe({
        next: (result) => {
          if (result.display_name) {
            this.addressResolved.emit(result.display_name);
          }
        },
        error: () => {},
      });
  }

  private hasCoords(
    value: MapLocation,
  ): value is { latitude: number; longitude: number } {
    return typeof value.latitude === 'number' && typeof value.longitude === 'number';
  }

  writeValue(obj: MapLocation | null): void {
    this.value = obj ?? { latitude: null, longitude: null };

    if (!this.map || !this.hasCoords(this.value)) return;

    this.setMarker(this.value.latitude, this.value.longitude);
    this.map.setView([this.value.latitude, this.value.longitude], DEFAULT_ZOOM);
  }

  registerOnChange(fn: (value: MapLocation) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
