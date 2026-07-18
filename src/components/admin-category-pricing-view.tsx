"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { pricingApi, type CancellationTier, type DepositBand } from "@/lib/api/pricing";
import { ApiError } from "@/lib/api/client";
import { useToast } from "./toast-provider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function messageOf(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}
const num = (v: string) => (v === "" ? 0 : Number(v));

export function AdminCategoryPricingView({ categoryId }: { categoryId: string }) {
  const { showToast } = useToast();
  const [bands, setBands] = useState<DepositBand[]>([]);
  const [tiers, setTiers] = useState<CancellationTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    pricingApi.get(categoryId)
      .then((p) => { if (active) { setBands(p.depositBands); setTiers(p.cancellationTiers); } })
      .catch((caught) => showToast(messageOf(caught, "Pricing policy could not be loaded."), { tone: "error" }))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [categoryId, showToast]);

  async function save() {
    setSaving(true);
    try {
      await pricingApi.save(categoryId, bands, tiers);
      showToast("Pricing policy saved.", { tone: "success" });
    } catch (caught) {
      showToast(messageOf(caught, "Could not save the pricing policy."), { tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading pricing…</p>;

  return (
    <div className="space-y-6 rounded-md border p-4">
      <div>
        <h3 className="font-semibold">Deposit guidance bands</h3>
        <p className="text-sm text-muted-foreground">Suggested deposit + damage cap per declared item-value range.</p>
      </div>
      {bands.map((b, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-5 items-end">
          {(["minValue", "maxValue", "depositMin", "depositMax", "damageCap"] as const).map((k) => (
            <div key={k} className="space-y-1">
              <Label className="text-xs capitalize">{k.replace(/([A-Z])/g, " $1")}</Label>
              <Input inputMode="decimal" value={b[k] ?? ""} onChange={(e) =>
                setBands((cur) => cur.map((x, j) => (j === i ? { ...x, [k]: num(e.target.value) } : x)))} />
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setBands((c) => c.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setBands((c) => [...c, { minValue: 0, maxValue: 0, depositMin: 0, depositMax: 0, damageCap: 0 }])}><Plus className="size-4" /> Add band</Button>

      <div>
        <h3 className="font-semibold">Cancellation schedule</h3>
        <p className="text-sm text-muted-foreground">% of rental charge withheld when cancelling within N hours of start. Displayed and snapshotted per booking.</p>
      </div>
      {tiers.map((t, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Hours before start</Label>
            <Input inputMode="numeric" value={t.hoursBefore ?? ""} onChange={(e) =>
              setTiers((cur) => cur.map((x, j) => (j === i ? { ...x, hoursBefore: num(e.target.value) } : x)))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Withhold %</Label>
            <Input inputMode="decimal" value={t.withholdPct ?? ""} onChange={(e) =>
              setTiers((cur) => cur.map((x, j) => (j === i ? { ...x, withholdPct: num(e.target.value) } : x)))} />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setTiers((c) => c.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setTiers((c) => [...c, { hoursBefore: 24, withholdPct: 0 }])}><Plus className="size-4" /> Add tier</Button>

      <div><Button disabled={saving} onClick={save}>{saving ? "Saving…" : "Save pricing policy"}</Button></div>
    </div>
  );
}
