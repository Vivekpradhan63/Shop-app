import { cn } from "@/lib/utils";
import { ORDER_STEPS, stepIndex } from "@/utils/orderStatus";
import { Check } from "lucide-react";

const labels = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function OrderStatusStepper({ status }) {
  const current = stepIndex(status);

  return (
    <div className="w-full">
      <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {ORDER_STEPS.map((step, idx) => {
          const done = idx <= current;
          const active = idx === current;
          return (
            <li key={step} className="flex flex-1 items-center gap-3 sm:flex-col sm:text-center">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  done ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground",
                  active && "ring-2 ring-ring ring-offset-2"
                )}
              >
                {done ? <Check className="h-5 w-5" /> : idx + 1}
              </div>
              <div>
                <p className={cn("font-medium", active && "text-primary")}>{labels[step]}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
