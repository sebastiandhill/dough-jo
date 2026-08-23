import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="plate relative w-full h-[230px]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-600 text-sm px-4 text-center">
            {product.photoHint}
          </div>
        )}
      </div>
      <h3 className="text-[25px] font-semibold m-0">{product.name}</h3>
      <p className="m-0 text-[18px]">{product.description}</p>
      <div className="mt-auto font-heading text-[22px] tabular-nums text-accent-700">
        {formatMoney(product.price)} / {product.unit}
      </div>
    </div>
  );
}
