"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { AdminPageHeader } from "./admin-ui";
import { useToast } from "./toast-provider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";

const FIELDS: { key: string; label: string; help?: string }[] = [
  { key: "platform_fee_percent", label: "Platform commission (%)", help: "0 for free launch; applies to future completed bookings when raised." },
  { key: "review_window_days", label: "Review window (days)" },
];

function messageOf(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}

export function AdminSettingsView() {
  const { showToast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  useEffect(() => {
    let active = true;
    adminApi.settings()
      .then((v) => { if (active) setValues(v); })
      .catch((caught) => { if (active) setError(messageOf(caught, "Settings could not be loaded.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function save(key: string) {
    setSaving(key);
    try {
      const updated = await adminApi.updateSetting(key, values[key] ?? "");
      setValues(updated);
      showToast("Setting saved.", { tone: "success" });
    } catch (caught) {
      showToast(messageOf(caught, "Could not save the setting."), { tone: "error" });
    } finally {
      setSaving("");
    }
  }

  return (
    <div className="admin-scope space-y-6">
      <AdminPageHeader title="Platform settings" description="Values that change behaviour without a redeploy." />
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {loading ? (
        <div className="space-y-4 max-w-md">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="space-y-6 max-w-md">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label htmlFor={f.key}>{f.label}</Label>
              <div className="flex gap-2">
                <Input
                  id={f.key}
                  inputMode="decimal"
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
                <Button disabled={saving === f.key} onClick={() => save(f.key)}>
                  {saving === f.key ? "Saving…" : "Save"}
                </Button>
              </div>
              {f.help && <p className="text-sm text-muted-foreground">{f.help}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
