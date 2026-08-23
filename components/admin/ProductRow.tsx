import Image from "next/image";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function ProductRow({
  product,
  onCapChange,
  onToggle,
}: {
  product: Product;
  onCapChange: (cap: number) => void;
  onToggle: () => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[88px_minmax(0,1fr)_150px_170px_150px] gap-5 items-center p-6 border border-divider rounded-md bg-neutral-100">
      <div className="plate relative w-22 h-22 sm:w-[88px] sm:h-[88px]">
        {product.image ? (
          <Image src={product.image} alt="" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-600 text-[11px] text-center px-1">
            Photo
          </div>
        )}
      </div>
      <div>
        <div className="font-heading text-2xl font-semibold">{product.name}</div>
        <div className="text-lg text-neutral-700">{product.description}</div>
      </div>
      <div>
        <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700">
          Price
        </div>
        <div className="font-heading text-2xl tabular-nums">
          ${product.price} / {product.unit}
        </div>
      </div>
      <div>
        <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700 mb-1.5">
          Max per bake day
        </div>
        <div className="flex items-center border border-divider rounded-md overflow-hidden w-max">
          <button
            type="button"
            aria-label="Fewer"
            onClick={() => onCapChange(Math.max(0, product.maxPerBakeDay - 1))}
            className="w-12 h-12 text-[26px] border-r border-divider hover:bg-black/[0.05] cursor-pointer"
          >
            –
          </button>
          <span className="min-w-14 text-center font-heading text-xl tabular-nums">
            {product.maxPerBakeDay}
          </span>
          <button
            type="button"
            aria-label="More"
            onClick={() => onCapChange(product.maxPerBakeDay + 1)}
            className="w-12 h-12 text-[26px] border-l border-divider hover:bg-black/[0.05] cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
      <Button
        size="sm"
        variant={product.available ? "primary" : "secondary"}
        onClick={onToggle}
        className="whitespace-nowrap"
      >
        {product.available ? "On the website" : "Hidden"}
      </Button>
    </div>
  );
}
