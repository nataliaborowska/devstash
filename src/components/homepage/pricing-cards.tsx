"use client";

import { useState } from "react";
import { Checklist } from "@/components/homepage/checklist";
import { LinkButton } from "@/components/homepage/link-button";
import { Badge } from "@/components/ui/badge";
import { PRICING_PLANS, type BillingPeriod, type HomepageLinks } from "@/lib/homepage";
import { cn } from "@/lib/utils";

const BILLING_OPTIONS: { value: BillingPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

interface PricingCardsProps {
  planLinks: HomepageLinks["plans"];
}

export function PricingCards({ planLinks }: PricingCardsProps) {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  return (
    <>
      <div
        role="group"
        aria-label="Billing period"
        className="mx-auto mb-10 flex w-fit gap-1 rounded-full border border-border bg-card p-1"
      >
        {BILLING_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={billing === option.value}
            onClick={() => setBilling(option.value)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              billing === option.value ? "bg-violet-600 text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
            {option.value === "yearly" && (
              <span className="rounded-full bg-emerald-500/15 px-1.5 text-xs text-emerald-400">Save 25%</span>
            )}
          </button>
        ))}
      </div>

      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        {PRICING_PLANS.map((plan) => {
          const price = plan.prices[billing];
          const link = planLinks[plan.id];
          return (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-8",
                plan.featured ? "border-violet-500/60 shadow-xl shadow-violet-600/10" : "border-border",
              )}
            >
              {plan.featured && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-violet-600 text-white">
                  Most Popular
                </Badge>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{price.amount}</span>
                <span className="text-muted-foreground">{price.period}</span>
              </p>
              <p className="mt-2 mb-6 text-sm text-muted-foreground">{price.note}</p>
              <div className="mb-8 flex-1">
                <Checklist items={plan.features} />
              </div>
              <LinkButton href={link.href} variant={plan.featured ? "primary" : "outline"} className="w-full">
                {link.label}
              </LinkButton>
            </article>
          );
        })}
      </div>
    </>
  );
}
