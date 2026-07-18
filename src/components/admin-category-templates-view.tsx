"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { templatesApi, type FieldDefinition, type FieldType, type TemplateScope } from "@/lib/api/templates";
import { ApiError } from "@/lib/api/client";
import { AdminPageHeader } from "./admin-ui";
import { useToast } from "./toast-provider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";

const SCOPES: TemplateScope[] = ["VERIFICATION", "LISTING", "BOOKING"];
const TYPES: FieldType[] = ["TEXT", "NUMBER", "DATE", "SELECT", "MULTISELECT", "BOOLEAN", "DOCUMENT", "DOCUMENT_LIST"];

function emptyField(): FieldDefinition {
  return { key: "", label: "", type: "TEXT", required: false, options: null, help: null };
}

function messageOf(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}

export function AdminCategoryTemplatesView({ categoryId }: { categoryId: string }) {
  const { showToast } = useToast();
  const [byScope, setByScope] = useState<Record<TemplateScope, FieldDefinition[]>>({
    VERIFICATION: [], LISTING: [], BOOKING: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<TemplateScope | "">("");

  useEffect(() => {
    let active = true;
    templatesApi.forCategory(categoryId)
      .then((templates) => {
        if (!active) return;
        const next: Record<TemplateScope, FieldDefinition[]> = { VERIFICATION: [], LISTING: [], BOOKING: [] };
        // forCategory returns highest versions first per scope; take the first seen per scope.
        for (const t of templates) if (next[t.scope].length === 0) next[t.scope] = t.fields;
        setByScope(next);
      })
      .catch((caught) => showToast(messageOf(caught, "Templates could not be loaded."), { tone: "error" }))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [categoryId, showToast]);

  function update(scope: TemplateScope, index: number, patch: Partial<FieldDefinition>) {
    setByScope((s) => ({ ...s, [scope]: s[scope].map((f, i) => (i === index ? { ...f, ...patch } : f)) }));
  }
  function add(scope: TemplateScope) {
    setByScope((s) => ({ ...s, [scope]: [...s[scope], emptyField()] }));
  }
  function remove(scope: TemplateScope, index: number) {
    setByScope((s) => ({ ...s, [scope]: s[scope].filter((_, i) => i !== index) }));
  }

  async function save(scope: TemplateScope) {
    const fields = byScope[scope];
    const keys = new Set<string>();
    for (const f of fields) {
      if (!/^[a-z0-9_]+$/.test(f.key)) return showToast(`Field key "${f.key || "(empty)"}" must be lowercase/underscore.`, { tone: "error" });
      if (!f.label.trim()) return showToast(`Field "${f.key}" needs a label.`, { tone: "error" });
      if ((f.type === "SELECT" || f.type === "MULTISELECT") && !(f.options?.length)) return showToast(`Field "${f.key}" needs options.`, { tone: "error" });
      if (keys.has(f.key)) return showToast(`Duplicate key "${f.key}".`, { tone: "error" });
      keys.add(f.key);
    }
    setSaving(scope);
    try {
      await templatesApi.save(categoryId, scope, fields);
      showToast(`${scope} template saved.`, { tone: "success" });
    } catch (caught) {
      showToast(messageOf(caught, "Could not save the template."), { tone: "error" });
    } finally {
      setSaving("");
    }
  }

  return (
    <div className="admin-scope space-y-6">
      <Link href="/admin/categories" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Back to categories
      </Link>
      <AdminPageHeader
        title="Category fields"
        description="Define the fields providers, owners, and renters fill in for this category. Saving creates a new version; existing listings keep the version they answered."
      />
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <Tabs defaultValue="LISTING">
          <TabsList>
            {SCOPES.map((s) => <TabsTrigger key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</TabsTrigger>)}
          </TabsList>
          {SCOPES.map((scope) => (
            <TabsContent key={scope} value={scope} className="space-y-4 pt-4">
              {byScope[scope].length === 0 && <p className="text-sm text-muted-foreground">No fields yet.</p>}
              {byScope[scope].map((f, i) => (
                <div key={i} className="rounded-md border p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Key</Label>
                      <Input value={f.key} placeholder="trade_license_no" onChange={(e) => update(scope, i, { key: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Label</Label>
                      <Input value={f.label} placeholder="Trade licence number" onChange={(e) => update(scope, i, { label: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Type</Label>
                      <Select value={f.type} onValueChange={(v) => update(scope, i, { type: v as FieldType })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input type="checkbox" checked={f.required} onChange={(e) => update(scope, i, { required: e.target.checked })} />
                        Required
                      </label>
                    </div>
                    {(f.type === "SELECT" || f.type === "MULTISELECT") && (
                      <div className="space-y-1 sm:col-span-2">
                        <Label>Options (comma-separated)</Label>
                        <Input
                          value={(f.options ?? []).join(", ")}
                          placeholder="S, M, L"
                          onChange={(e) => update(scope, i, { options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean) })}
                        />
                      </div>
                    )}
                    <div className="space-y-1 sm:col-span-2">
                      <Label>Help text (optional)</Label>
                      <Input value={f.help ?? ""} onChange={(e) => update(scope, i, { help: e.target.value || null })} />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => remove(scope, i)}>
                    <Trash2 className="size-4" /> Remove
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => add(scope)}><Plus className="size-4" /> Add field</Button>
                <Button size="sm" disabled={saving === scope} onClick={() => save(scope)}>
                  {saving === scope ? "Saving…" : `Save ${scope.charAt(0) + scope.slice(1).toLowerCase()} template`}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
