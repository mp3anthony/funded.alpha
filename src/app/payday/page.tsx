import { Calendar, Clock } from "lucide-react";

export default function Payday() {
  const upcomingPaydays = [
    {
      id: 1,
      date: "July 05, 2026",
      relative: "In 12 days",
      amount: 4250.00,
      source: "QuantumShift Corp",
      status: "Scheduled",
      statusColor: "text-secondary bg-secondary/10",
    },
    {
      id: 2,
      date: "July 19, 2026",
      relative: "In 26 days",
      amount: 4250.00,
      source: "QuantumShift Corp",
      status: "Scheduled",
      statusColor: "text-secondary bg-secondary/10",
    },
    {
      id: 3,
      date: "August 02, 2026",
      relative: "In 40 days",
      amount: 4250.00,
      source: "QuantumShift Corp",
      status: "Scheduled",
      statusColor: "text-secondary bg-secondary/10",
    },
    {
      id: 4,
      date: "August 16, 2026",
      relative: "In 54 days",
      amount: 4250.00,
      source: "QuantumShift Corp",
      status: "Scheduled",
      statusColor: "text-secondary bg-secondary/10",
    },
  ];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Payday Schedule
        </h1>
        <p className="text-sm text-muted mt-1">
          Monitor your income streams and payroll dates.
        </p>
      </div>

      {/* Prominent Countdown Card — intentional hero gradient, kept as-is */}
      <div className="relative overflow-hidden bg-gradient-to-br from-secondary to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-secondary/15">
        {/* Background visual accents */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute left-1/3 top-0 -translate-y-12 w-32 h-32 bg-white/5 rounded-full blur-xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide uppercase">
              <Clock className="h-3.5 w-3.5" />
              Next Payday
            </span>
            <div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight">12 Days</div>
              <p className="text-sm text-blue-100/90 mt-1.5 font-medium">
                Scheduled for Sunday, July 05, 2026
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-200/80">
              <span>Source:</span>
              <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">QuantumShift Corp</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:min-w-[240px] flex flex-col justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-200">
              Estimated Net Amount
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl sm:text-4xl font-extrabold">$4,250.00</span>
            </div>
            <div className="border-t border-white/10 mt-4 pt-3 flex items-center justify-between text-xs text-blue-100/85">
              <span>Direct Deposit</span>
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
          Upcoming Paychecks
        </h2>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          {upcomingPaydays.map((payday) => (
            <div
              key={payday.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-raised transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 rounded-xl bg-secondary/10 text-secondary items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground">
                    {payday.date}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted">
                      {payday.source}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-border-strong" />
                    <span className="text-xs font-semibold text-muted">
                      {payday.relative}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                <div className="text-left sm:text-right">
                  <span className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-1 sm:justify-end">
                    <span className="text-primary text-sm font-semibold">+</span>
                    ${payday.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="block text-[10px] text-muted font-medium mt-0.5">
                    Bi-Weekly Payroll
                  </span>
                </div>
                <div className={`flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${payday.statusColor}`}>
                  {payday.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
