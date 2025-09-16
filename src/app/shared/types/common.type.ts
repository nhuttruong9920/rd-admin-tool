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
  code: string | null;
  message: string | null;
};

export type { Api, Button, Column, KeyValue, LabelValue };
