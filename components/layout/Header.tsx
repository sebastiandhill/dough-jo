import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#our-bread", label: "Our Bread" },
  { href: "/#about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-bg border-b border-divider">
      <div className="max-w-[1180px] mx-auto px-6 py-3.5 flex items-center gap-7">
        <Link
          href="/"
          className="flex items-center gap-3 text-inherit no-underline"
        >
          <Image
            src="/images/dough-jo-logo.png"
            alt="Dough Jo"
            width={124}
            height={124}
            priority
            className="w-[68px] h-[68px] lg:w-[124px] lg:h-[124px]"
          />
          <span className="flex flex-col items-start gap-0.5">
            <span className="font-heading text-[27px] tracking-[-0.01em] whitespace-nowrap">
              Dough Jo
            </span>
            <span className="font-body text-[15px] tracking-[0.12em] uppercase text-neutral-700 whitespace-nowrap">
              Home Page
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 ml-3 text-lg whitespace-nowrap">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-inherit no-underline py-1.5 border-b border-transparent hover:border-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/order" className="ml-auto">
          <Button size="sm" className="whitespace-nowrap">
            ORDER BREAD
          </Button>
        </Link>
        <Link href="/regular-order" className="hidden lg:block">
          <Button variant="secondary" size="sm" className="whitespace-nowrap">
            REGULAR ORDERS
          </Button>
        </Link>
      </div>

      <nav className="lg:hidden flex items-stretch border-t border-divider overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/order"
          className="flex-none min-h-12 flex items-center px-4.5 py-3 border-r border-divider text-inherit no-underline text-[17px] whitespace-nowrap"
        >
          Order Bread
        </Link>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex-none min-h-12 flex items-center px-4.5 py-3 border-r border-divider text-inherit no-underline text-[17px] whitespace-nowrap"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/regular-order"
          className="flex-none min-h-12 flex items-center px-4.5 py-3 text-inherit no-underline text-[17px] whitespace-nowrap"
        >
          Regular Orders
        </Link>
      </nav>
    </header>
  );
}
