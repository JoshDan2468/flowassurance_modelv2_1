import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { riskBgClass, riskTextClass } from "@/lib/risk";
import type { RiskItem } from "@/types/prediction";

export function RiskCard({ risk, index = 0 }: { risk: RiskItem; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={`border ${riskBgClass(risk.level)}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {risk.label}
              </div>
              <div className={`mt-2 font-mono text-3xl font-semibold ${riskTextClass(risk.level)}`}>
                {(risk.probability * 100).toFixed(1)}%
              </div>
            </div>
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${riskTextClass(risk.level)}`}
              style={{ borderColor: "currentColor" }}
            >
              {risk.level}
            </span>
          </div>
          <Progress
            value={risk.probability * 100}
            className="mt-3 h-1.5 bg-background/50"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}