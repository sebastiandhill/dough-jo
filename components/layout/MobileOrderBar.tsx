import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function MobileOrderBar() {
  return (
    <div className="sticky bottom-0 z-30 bg-neutral-100 border-t border-divider shadow-[var(--shadow-md)] px-6 py-3.5 flex items-center justify-center">
      <Link href="/order">
        <Button size="lg" className="whitespace-nowrap">
          ORDER BREAD
        </Button>
      </Link>
    </div>
  );
}
