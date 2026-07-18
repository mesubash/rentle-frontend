import { apiRequest } from "./client";
import type { UUID } from "./shared";

export type FieldType =
  | "TEXT" | "NUMBER" | "DATE" | "SELECT" | "MULTISELECT" | "BOOLEAN" | "DOCUMENT" | "DOCUMENT_LIST";
export type TemplateScope = "VERIFICATION" | "LISTING" | "BOOKING";

export type FieldDefinition = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: string[] | null;
  help: string | null;
};

export type Template = {
  id: UUID;
  categoryId: UUID;
  scope: TemplateScope;
  version: number;
  fields: FieldDefinition[];
};

export const templatesApi = {
  // Public: the current template for a category+scope (null if none configured).
  current: (categoryId: UUID, scope: TemplateScope) =>
    apiRequest<Template | null>(`/categories/${categoryId}/templates/${scope}`),
  // Admin: all templates configured on a category.
  forCategory: (categoryId: UUID) =>
    apiRequest<Template[]>(`/admin/categories/${categoryId}/templates`),
  save: (categoryId: UUID, scope: TemplateScope, fields: FieldDefinition[]) =>
    apiRequest<Template>(`/admin/categories/${categoryId}/templates/${scope}`, {
      method: "PUT",
      body: { fields },
    }),
};
