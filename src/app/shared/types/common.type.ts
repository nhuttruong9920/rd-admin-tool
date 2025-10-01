type LabelValue<T> = {
  label: string;
  value: T;
  id?: string;
};

type KeyValue<T> = Record<string, T>;

type Column = {
  field: string;
  header: string;
};

type Button = {
  key: string;
  icon: string;
  class: string;
  command: () => void;
  hidden?: boolean;
};

type Api<T> = {
  data: T | null;
  isSucceeded: boolean;
  message: string | null;
};

type Api2<T> = {
  data: T | null;
  success: boolean;
  message: string | null;
  errors: string[] | null;
};

type CommonStoreInitialState<T> = {
  data: T | null;
  _loading: boolean;
  error: string | null;
  searchTerm: string;
};

export type { Api, Api2, Button, Column, KeyValue, LabelValue, CommonStoreInitialState };
