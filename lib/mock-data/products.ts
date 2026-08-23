import type { Product } from "@/lib/types";

export const initialProducts: Product[] = [
  {
    id: "classic",
    name: "Artisan Sourdough Bread",
    description:
      "Long-fermented organic sourdough with a crisp crust and a soft, flavorful interior.",
    price: 12,
    unit: "loaf",
    image: "/images/product-classic.webp",
    photoHint: "Classic loaf — crumb or whole loaf",
    available: true,
    maxPerBakeDay: 6,
  },
  {
    id: "inclusion",
    name: "Jalapeño Cheddar Focaccia",
    description:
      "Focaccia baked with jalapeño and European cheddar. Rich, a little heat.",
    price: 18,
    unit: "pan",
    image: "/images/product-inclusion.webp",
    photoHint: "Jalapeño cheddar focaccia, cut into squares",
    available: true,
    maxPerBakeDay: 4,
  },
  {
    id: "focaccia",
    name: "Focaccia",
    description:
      "Dimpled, olive-oil rich focaccia. Good with dinner, better the next morning.",
    price: 15,
    unit: "pan",
    image: "/images/product-focaccia.webp",
    photoHint: "Plain focaccia, close crop",
    available: true,
    maxPerBakeDay: 4,
  },
  {
    id: "pizza",
    name: "Parbaked Pizza Crust",
    description:
      "Par-baked sourdough crust. Add toppings and finish it in your own oven. No commercial yeast, just sourdough starter!",
    price: 12,
    unit: "crust",
    image: "/images/product-pizza.webp",
    photoHint: "Par-baked crust on a wooden board",
    available: true,
    maxPerBakeDay: 8,
  },
];
