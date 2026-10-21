export type RecordFieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "select"
  | "number"
  | "checkbox"
  | "slug"
  | "image"
  | "gallery"
  | "social"
  | "sections"
  | "date"
  | "datetime"
  | "email"
  | "url"
  | "password";

export interface RecordField {
  name: string;
  label: string;
  type: RecordFieldType;
  hint?: string;
  placeholder?: string;
  optional?: boolean;
  rows?: number;
  options?: { value: string; label: string }[];
  wide?: boolean;
  folder?: string;
  min?: number;
  max?: number;
  sourceField?: string;
}
