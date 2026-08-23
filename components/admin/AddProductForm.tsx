"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AddProductForm({
  onSave,
  onCancel,
}: {
  onSave: (input: {
    name: string;
    description: string;
    price: number;
    unit: string;
    maxPerBakeDay: number;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("loaf");
  const [cap, setCap] = useState(4);

  const saveDisabled = !name.trim() || !price.trim();

  function handleSave() {
    if (saveDisabled) return;
    onSave({
      name: name.trim(),
      description: desc.trim(),
      price: parseFloat(price.replace(/[^0-9.]/g, "")) || 0,
      unit: unit.trim() || "loaf",
      maxPerBakeDay: cap,
    });
  }

  return (
    <section className="border border-accent rounded-md bg-neutral-100 p-7 mb-9">
      <h2 className="font-heading text-[32px] font-semibold m-0 mb-6">
        New product
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-[230px_minmax(0,1fr)] gap-7 items-start">
        <div>
          <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700 mb-2">
            Picture
          </div>
          <div className="plate w-full h-[200px] flex items-center justify-center bg-neutral-200 text-neutral-600 text-sm text-center px-4">
            Drop a photo of this product
          </div>
        </div>
        <div className="flex flex-col gap-5.5">
          <label className="block">
            <span className="block text-lg mb-2">Product name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cinnamon Raisin Loaf"
              className="w-full min-h-14 text-xl px-4 py-3 border border-divider rounded-md bg-transparent"
            />
          </label>
          <label className="block">
            <span className="block text-lg mb-2">
              Description — this is what customers read
            </span>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Long-fermented sourdough with organic cinnamon and raisins."
              className="w-full text-xl px-4 py-3 border border-divider rounded-md bg-transparent resize-y"
            />
          </label>
          <div className="flex gap-6 flex-wrap">
            <label className="block">
              <span className="block text-lg mb-2">Price</span>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="14"
                className="w-[140px] min-h-14 text-xl px-4 py-3 border border-divider rounded-md bg-transparent tabular-nums"
              />
            </label>
            <label className="block">
              <span className="block text-lg mb-2">Sold by</span>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="loaf"
                className="w-[180px] min-h-14 text-xl px-4 py-3 border border-divider rounded-md bg-transparent"
              />
            </label>
            <div>
              <span className="block text-lg mb-2">Max per bake day</span>
              <div className="flex items-center border border-divider rounded-md overflow-hidden w-max">
                <button
                  type="button"
                  aria-label="Fewer"
                  onClick={() => setCap((c) => Math.max(0, c - 1))}
                  className="w-14 h-14 text-[26px] border-r border-divider hover:bg-black/[0.05] cursor-pointer"
                >
                  –
                </button>
                <span className="min-w-15 text-center font-heading text-xl tabular-nums">
                  {cap}
                </span>
                <button
                  type="button"
                  aria-label="More"
                  onClick={() => setCap((c) => c + 1)}
                  className="w-14 h-14 text-[26px] border-l border-divider hover:bg-black/[0.05] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap mt-1.5">
            <Button onClick={handleSave} disabled={saveDisabled}>
              SAVE PRODUCT
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <p className="m-0 text-lg text-neutral-700">
            New products start hidden. Turn one on when you&apos;re ready for
            customers to order it.
          </p>
        </div>
      </div>
    </section>
  );
}
