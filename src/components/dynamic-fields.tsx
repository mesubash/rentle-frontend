"use client";

import type { FieldDefinition } from "@/lib/api/templates";

/**
 * Renders a category field template as marketplace form controls (globals.css .field classes).
 * Handles the scalar field types used by LISTING/BOOKING scopes. Values are a plain object keyed
 * by field.key; the parent owns the state and sends it as the `attributes` map on create.
 * DOCUMENT/DOCUMENT_LIST (VERIFICATION-only) are intentionally not handled here.
 */
export function DynamicFields({
  fields,
  values,
  onChange,
  idPrefix = "attr",
}: {
  fields: FieldDefinition[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  idPrefix?: string;
}) {
  if (!fields.length) return null;
  return (
    <>
      {fields.map((f) => {
        const id = `${idPrefix}-${f.key}`;
        const value = values[f.key];
        return (
          <div className="field" key={f.key}>
            <label htmlFor={id}>
              {f.label}
              {!f.required && <span className="muted"> (optional)</span>}
            </label>
            {f.type === "TEXT" && (
              <input id={id} value={(value as string) ?? ""} onChange={(e) => onChange(f.key, e.target.value)} maxLength={500} />
            )}
            {f.type === "NUMBER" && (
              <input id={id} inputMode="decimal" value={(value as string) ?? ""} onChange={(e) => onChange(f.key, e.target.value.replace(/[^\d.]/g, ""))} />
            )}
            {f.type === "DATE" && (
              <input id={id} type="date" value={(value as string) ?? ""} onChange={(e) => onChange(f.key, e.target.value)} />
            )}
            {f.type === "SELECT" && (
              <select id={id} value={(value as string) ?? ""} onChange={(e) => onChange(f.key, e.target.value)}>
                <option value="">Select…</option>
                {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            {f.type === "MULTISELECT" && (
              <div className="checkbox-row">
                {(f.options ?? []).map((o) => {
                  const list = Array.isArray(value) ? (value as string[]) : [];
                  const checked = list.includes(o);
                  return (
                    <label key={o} className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onChange(f.key, checked ? list.filter((x) => x !== o) : [...list, o])}
                      />
                      {o}
                    </label>
                  );
                })}
              </div>
            )}
            {f.type === "BOOLEAN" && (
              <label className="checkbox-inline">
                <input id={id} type="checkbox" checked={value === true || value === "true"} onChange={(e) => onChange(f.key, e.target.checked)} />
                Yes
              </label>
            )}
            {f.help && <small>{f.help}</small>}
          </div>
        );
      })}
    </>
  );
}
