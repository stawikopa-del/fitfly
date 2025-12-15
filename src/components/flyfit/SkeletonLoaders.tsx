import { Skeleton } from '@/components/ui/skeleton';

// Home page skeleton
export function HomeSkeleton() {
  return (
    <div className="px-4 py-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-16 w-28 rounded-2xl" />
      </div>

      {/* Today's plans */}
      <Skeleton className="h-32 w-full rounded-2xl" />

      {/* Level progress */}
      <Skeleton className="h-16 w-full rounded-2xl" />

      {/* Chat hero */}
      <Skeleton className="h-40 w-full rounded-3xl" />

      {/* Stats grid 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>

      {/* Water tracker */}
      <Skeleton className="h-32 w-full rounded-2xl" />

      {/* Quick actions */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
}

// Nutrition page skeleton
export function NutritionSkeleton() {
  return (
    <div className="px-4 py-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <Skeleton className="h-4 w-48 rounded-lg" />
      </div>

      {/* Calories summary */}
      <Skeleton className="h-44 w-full rounded-3xl" />

      {/* Macros grid */}
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
      </div>

      {/* Action buttons */}
      <Skeleton className="h-20 w-full rounded-3xl" />
      <Skeleton className="h-20 w-full rounded-3xl" />
      <Skeleton className="h-20 w-full rounded-3xl" />

      {/* Meal sections */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}

// Progress page skeleton
export function ProgressSkeleton() {
  return (
    <div className="px-4 py-4 space-y-6 animate-pulse">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
      </div>

      {/* Metric selector */}
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-12 rounded-2xl" />
        <Skeleton className="flex-1 h-12 rounded-2xl" />
        <Skeleton className="flex-1 h-12 rounded-2xl" />
      </div>

      {/* Chart */}
      <Skeleton className="h-64 w-full rounded-3xl" />

      {/* Stats section */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-3xl" />
      </div>
    </div>
  );
}

// Goals page skeleton
export function GoalsSkeleton() {
  return (
    <div className="px-5 py-6 space-y-6 animate-pulse">
      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>

      {/* Goal cards */}
      <div className="space-y-4">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    </div>
  );
}

// Generic card skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return <Skeleton className={`h-24 w-full rounded-2xl ${className}`} />;
}

// Stat card skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border/50 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-6 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

// List item skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 animate-pulse">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

// Friends list skeleton
export function FriendsListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
          <Skeleton className="w-20 h-8 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
