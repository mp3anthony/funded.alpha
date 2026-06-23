import { User, Bell, Users, LogOut, ChevronRight, ShieldAlert } from "lucide-react";

export default function Settings() {
  const settingsOptions = [
    {
      id: "profile",
      name: "Profile Settings",
      description: "Manage your personal information and contact details.",
      icon: User,
      color: "bg-secondary/10 text-secondary",
    },
    {
      id: "notifications",
      name: "Notifications",
      description: "Configure alerts for payday, upcoming bills, and low balances.",
      icon: Bell,
      color: "bg-accent/10 text-accent",
    },
    {
      id: "household",
      name: "Household Members",
      description: "Share savings goals and bills with your family.",
      icon: Users,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      id: "security",
      name: "Security & PIN",
      description: "Adjust login credentials and transaction confirmation settings.",
      icon: ShieldAlert,
      color: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted mt-1">
          Customize your application and account preferences.
        </p>
      </div>

      {/* User profile card */}
      <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-sm flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-secondary to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
          A
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            Alex Morgan
          </h3>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            alex.morgan@example.com
          </p>
          <span className="inline-block text-[10px] font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-2 py-0.5 rounded-md mt-2">
            Funded Premium
          </span>
        </div>
      </div>

      {/* Settings list */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
          Preferences
        </h2>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          {settingsOptions.map((option) => {
            const OptionIcon = option.icon;

            return (
              <div
                key={option.id}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-surface-raised transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 rounded-xl items-center justify-center shrink-0 ${option.color}`}>
                    <OptionIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-foreground">
                      {option.name}
                    </h4>
                    <p className="text-xs text-muted mt-0.5 max-w-sm sm:max-w-md line-clamp-1">
                      {option.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-subtle group-hover:translate-x-0.5 transition-transform" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Out */}
      <div className="pt-2">
        <button className="w-full bg-destructive-light hover:bg-rose-100 dark:hover:bg-rose-950/30 text-destructive border border-destructive/20 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all duration-200 active:scale-[0.98]">
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
