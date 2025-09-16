export interface DogBreed {
  id: string;
  type: 'breed';
  attributes: {
    name: string;
    description: string;
    life: {
      max: number;
      min: number;
    };
    male_weight: {
      max: number;
      min: number;
    };
    female_weight: {
      max: number;
      min: number;
    };
    hypoallergenic: boolean;
  };
  relationships: {
    group: {
      data: {
        id: string;
        type: 'group';
      };
    };
  };
}

export interface DogApiResponse {
  data: DogBreed[];
  meta: {
    pagination: {
      current: number;
      next: number;
      last: number;
      records: number;
    };
  };
  links: {
    self: string;
    current: string;
    next: string;
    last: string;
  };
}

export interface DogState {
  breeds: DogBreed[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  searchTerm: string;
  allBreeds: DogBreed[]; // Store all loaded breeds for filtering
}
