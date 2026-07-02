import { MonthComparisonChart } from "@/features/dashboard/components/MonthComparisonChart";

export default function ComparisonPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Comparativo entre meses</h1>
        <p className="text-sm text-muted-foreground">
          Evolução de renda, gastos e economia nos últimos meses
        </p>
      </div>
      <MonthComparisonChart />
    </div>
  );
}
