import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AllVehiclesService {
  selectedTabIdx = signal<number>(0);
}
