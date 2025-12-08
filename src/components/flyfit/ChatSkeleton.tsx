import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function ChatListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="bg-card/80 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChatMessagesSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Friend message */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <Skeleton className="h-16 w-48 rounded-3xl rounded-bl-lg" />
      </div>
      
      {/* User message */}
      <div className="flex gap-3 flex-row-reverse">
        <Skeleton className="h-12 w-40 rounded-3xl rounded-br-lg" />
      </div>
      
      {/* Friend message */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <Skeleton className="h-20 w-56 rounded-3xl rounded-bl-lg" />
      </div>
      
      {/* User message */}
      <div className="flex gap-3 flex-row-reverse">
        <Skeleton className="h-10 w-32 rounded-3xl rounded-br-lg" />
      </div>
    </div>
  );
}

export function FitekChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Assistant message */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <Skeleton className="h-24 w-64 rounded-3xl rounded-bl-lg" />
      </div>
      
      {/* User message */}
      <div className="flex gap-3 flex-row-reverse">
        <Skeleton className="h-12 w-44 rounded-3xl rounded-br-lg" />
      </div>
      
      {/* Assistant message */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <Skeleton className="h-32 w-72 rounded-3xl rounded-bl-lg" />
      </div>
    </div>
  );
}
