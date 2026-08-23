import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

export function OrderProductRow({
  product,
  quantity,
  onIncrement,
  onDecrement,
}: {
  product: Product;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[210px_minmax(0,1fr)] gap-7 p-6 bg-neutral-100 border border-divider rounded-md">
      <div className="plate relative w-full h-[170px]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="210px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-600 text-sm px-4 text-center">
            {product.photoHint}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-[30px] font-semibold m-0">{product.name}</h2>
        <p className="m-0 text-[18px]">{product.description}</p>
        <div className="font-heading text-[23px] tabular-nums text-accent-700">
          {formatMoney(product.price)} / {product.unit}
        </div>
        <div className="flex items-center gap-4.5 mt-1.5">
          <span className="text-[17px] tracking-[0.06em] uppercase text-neutral-700">
            Quantity
          </span>
          <QuantityStepper
            quantity={quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            label={product.name}
          />
        </div>
      </div>
    </div>
  );
}
