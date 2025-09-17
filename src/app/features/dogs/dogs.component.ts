import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DogStore } from '../../shared/stores/dog.store';

@Component({
  selector: 'app-dogs',
  imports: [CommonModule, FormsModule],
  templateUrl: './dogs.component.html',
})
export class DogsComponent implements OnInit, OnDestroy {
  readonly dogStore = inject(DogStore);

  ngOnInit(): void {
    // Ensure breeds are loaded (store handles the logic)
    this.dogStore.ensureBreeds();
    // Start auto-refresh by default
    this.dogStore.startAutoRefresh();
  }

  ngOnDestroy(): void {
    // Clean up auto-refresh when component is destroyed
    this.dogStore.stopAutoRefresh();
  }

  onLoadMore(): void {
    const nextPage = this.dogStore.currentPage() + 1;
    if (nextPage <= this.dogStore.totalPages()) {
      this.dogStore.loadMoreBreeds({ page: nextPage });
    }
  }

  onRetry(): void {
    this.dogStore.clearError();
    this.dogStore.loadBreeds({ page: 1 });
  }

  onReset(): void {
    this.dogStore.reset();
  }

  onSearch(searchTerm: string): void {
    this.dogStore.setSearchTerm(searchTerm);
  }

  onClearSearch(): void {
    this.dogStore.clearSearch();
  }

  onToggleAutoRefresh(): void {
    this.dogStore.toggleAutoRefresh();
  }
}
