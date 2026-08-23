import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-divider mt-6 bg-header">
      <div className="max-w-[1180px] mx-auto px-6 py-11 flex flex-wrap gap-6 justify-between items-center">
        <div className="flex items-center gap-4">
          <Image
            src="/images/dough-jo-logo.png"
            alt=""
            width={80}
            height={80}
            className="w-16 h-16 sm:w-20 sm:h-20"
          />
          <div>
            <div className="font-heading text-2xl">Dough Jo</div>
            <div className="text-[17px] text-neutral-700">
              the blackbelt of sourdough
            </div>
          </div>
        </div>
        <p className="text-[17px] text-neutral-700 max-w-[44ch] m-0">
          Baked in Santa Rosa Beach, FL. Sourdough for the 30A neighborhood.
          Order here and we&apos;ll text you — no phone tag.
        </p>
      </div>
    </footer>
  );
}
