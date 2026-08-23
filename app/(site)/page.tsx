"use client";

import Image from "next/image";
import Link from "next/link";
import { useDough } from "@/lib/store";
import { bakerySettings } from "@/lib/mock-data/settings";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/products/ProductCard";
import { MobileOrderBar } from "@/components/layout/MobileOrderBar";

const features = [
  {
    title: "Organic ingredients",
    body: "High-quality ingredients chosen intentionally.",
  },
  { title: "Long fermented", body: "Good sourdough takes time." },
  { title: "No preservatives", body: "Because bread shouldn't need them." },
  { title: "Small batch", body: "Made locally, not manufactured." },
];

export default function HomePage() {
  const { products } = useDough();
  const availableProducts = products.filter((p) => p.available);

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <div className="bg-header border-b border-divider">
        <section className="max-w-[1180px] mx-auto px-6 py-16 lg:py-[72px] grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="flex items-center gap-2.5 text-base tracking-[0.1em] uppercase text-accent-700 mb-5">
              <span className="w-8 h-px bg-accent" />
              Baked locally in Santa Rosa Beach, FL
            </div>
            <h1 className="text-[42px] lg:text-[62px] font-normal leading-[1.05] m-0 mb-6">
              Really great sourdough.
              <br />
              Made right here in Santa Rosa Beach.
            </h1>
            <p className="text-xl max-w-[36ch] m-0 mb-9">
              Long-fermented sourdough made in small batches with
              high-quality organic ingredients. No preservatives. No
              unnecessary extras. Just great bread.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/order">
                <Button size="lg">ORDER BREAD</Button>
              </Link>
              <Link href="/regular-order">
                <Button variant="secondary" size="lg">
                  MAKE IT A REGULAR THING
                </Button>
              </Link>
            </div>
          </div>
          <div className="plate relative w-full h-[320px] sm:h-[420px] lg:h-[520px]">
            <Image
              src="/images/hero.webp"
              alt="A finished sourdough loaf on a wooden counter"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </section>
      </div>

      <hr className="max-w-[1180px] mx-auto w-full border-divider my-4" />

      {/* How it works */}
      <section id="how-it-works" className="max-w-[1180px] mx-auto w-full px-6 py-16">
        <h2 className="text-[42px] font-normal m-0 mb-11">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {[
            { n: 1, title: "Pick your bread", body: "Choose your loaf and quantity." },
            { n: 2, title: "Pick your day", body: "Choose from available pickup dates." },
            { n: 3, title: "Pick it up", body: "We'll text you when your bread is ready." },
          ].map((step) => (
            <div key={step.n} className="border-t border-divider pt-5">
              <div className="font-heading text-[44px] text-accent tabular-nums leading-none">
                {step.n}
              </div>
              <h3 className="text-[28px] font-semibold my-3.5">{step.title}</h3>
              <p className="m-0">{step.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 mb-0 px-6 py-5 bg-accent-100 border-l-[3px] border-accent text-[19px]">
          Every loaf is made fresh, so orders are placed at least{" "}
          {bakerySettings.leadTimeDays} days ahead. That&apos;s how long the
          dough needs.
        </p>
      </section>

      {/* Our bread */}
      <section
        id="our-bread"
        className="bg-neutral-100 border-y border-divider"
      >
        <div className="max-w-[1180px] mx-auto px-6 py-16">
          <h2 className="text-[42px] font-normal m-0 mb-3">Our bread</h2>
          <p className="m-0 mb-11 text-[19px]">
            Baked Tuesdays and Wednesdays. Pickup {bakerySettings.pickupWindow}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {availableProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Nothing weird */}
      <div className="bg-white border-b border-divider">
        <section className="max-w-[1180px] mx-auto px-6 py-16">
          <h2 className="text-[42px] font-normal m-0 mb-11">
            Nothing weird in your bread.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-9">
            {features.map((f) => (
              <div key={f.title} className="border-t border-divider pt-5">
                <h3 className="text-2xl font-semibold m-0 mb-2">{f.title}</h3>
                <p className="m-0">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* About */}
      <section
        id="about"
        className="max-w-[1180px] mx-auto w-full px-6 pt-6 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center"
      >
        <div className="plate relative w-full max-w-[475px] h-[380px] sm:h-[480px] lg:h-[541px] mx-auto lg:mx-0">
          <Image
            src="/images/baker.webp"
            alt="The baker in her kitchen"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-[32px] lg:text-[46px] font-normal m-0 mb-6">
            Made by Grandma. The slow way.
          </h2>
          <p className="text-xl">
            Dough Jo started the same way a lot of good things do—in a home
            kitchen.
          </p>
          <p className="text-xl">
            Every loaf is made in small batches using high-quality organic
            ingredients and a long fermentation process that simply can&apos;t
            be rushed.
          </p>
          <p className="text-xl">
            There aren&apos;t preservatives, unnecessary ingredients, or
            shortcuts.
          </p>
          <p className="text-xl mb-0">
            Just organic bread flour, filtered water, imported sea salt,
            starter, time, and a grandma who takes making really good bread
            pretty seriously.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral-900 text-neutral-100">
        <div className="max-w-[1180px] mx-auto px-6 py-16 flex flex-wrap gap-8 items-center justify-between">
          <div>
            <h2 className="text-[32px] lg:text-[44px] font-normal m-0 mb-3 text-neutral-100">
              Want bread on the regular?
            </h2>
            <p className="m-0 text-xl text-neutral-300">
              Set it once and your bread keeps showing up on your schedule.
              Change or skip anytime.
            </p>
          </div>
          <Link href="/regular-order">
            <Button
              size="lg"
              className="!text-accent-300 !bg-transparent !border-accent-400 hover:!bg-accent-400/[0.18]"
            >
              SET UP A REGULAR ORDER
            </Button>
          </Link>
        </div>
      </section>

      <MobileOrderBar />
    </main>
  );
}
