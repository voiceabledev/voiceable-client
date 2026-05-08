import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";

interface ComparisonRow {
  feature: string;
  human: string;
  answeringService: string;
  voiceable: string;
}

interface ComparisonTableProps {
  title?: string;
  rows: ComparisonRow[];
  column1Label?: string;
  column2Label?: string;
  column3Label?: string;
}

export function ComparisonTable({
  title = "AI Receptionist vs. Traditional Solutions",
  rows,
  column1Label = "Human Receptionist",
  column2Label = "Answering Service",
  column3Label = "Voiceable AI",
}: ComparisonTableProps) {
  return (
    <section className="py-24 px-6 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
          {title}
        </h2>
        
        <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border overflow-x-auto mt-12">
          <div className="min-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-foreground"></TableHead>
                  <TableHead className="font-semibold text-muted-foreground">{column1Label}</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">{column2Label}</TableHead>
                  <TableHead className="font-semibold text-primary">{column3Label}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index} className="hover:bg-card/50 transition-colors">
                    <TableCell className="font-medium text-foreground">{row.feature}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.human === "✓" ? (
                        <Check className="w-5 h-5 text-emerald-500 inline" />
                      ) : row.human === "✗" ? (
                        <X className="w-5 h-5 text-red-500 inline" />
                      ) : (
                        row.human
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.answeringService === "✓" ? (
                        <Check className="w-5 h-5 text-emerald-500 inline" />
                      ) : row.answeringService === "✗" ? (
                        <X className="w-5 h-5 text-red-500 inline" />
                      ) : (
                        row.answeringService
                      )}
                    </TableCell>
                    <TableCell className="text-foreground font-medium">
                      {row.voiceable === "✓" ? (
                        <Check className="w-5 h-5 text-emerald-500 inline" />
                      ) : row.voiceable === "✗" ? (
                        <X className="w-5 h-5 text-red-500 inline" />
                      ) : (
                        row.voiceable
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" variant="outline" className="rounded-full" asChild>
              <Link href="/sign-up">
                Start Measuring Results
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

