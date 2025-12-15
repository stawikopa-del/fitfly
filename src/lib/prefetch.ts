// Route prefetching utilities for faster navigation

const prefetchedRoutes = new Set<string>();

// Prefetch a route's component chunk
export const prefetchRoute = async (routePath: string) => {
  if (prefetchedRoutes.has(routePath)) return;
  prefetchedRoutes.add(routePath);

  try {
    const routeMap: Record<string, () => Promise<unknown>> = {
      '/': () => import('@/pages/Home'),
      '/treningi': () => import('@/pages/Workouts'),
      '/odzywianie': () => import('@/pages/Nutrition'),
      '/czat': () => import('@/pages/ChatList'),
      '/inne': () => import('@/pages/More'),
      '/profil': () => import('@/pages/Profile'),
      '/postepy': () => import('@/pages/Progress'),
      '/wyzwania': () => import('@/pages/Challenges'),
      '/ustawienia': () => import('@/pages/Settings'),
    };

    const importFn = routeMap[routePath];
    if (importFn) {
      await importFn();
    }
  } catch {
    // Silently fail - prefetch is just optimization
  }
};

// Prefetch critical routes after initial load
export const prefetchCriticalRoutes = () => {
  // Use requestIdleCallback for non-blocking prefetch
  const prefetch = () => {
    const criticalRoutes = ['/', '/treningi', '/odzywianie', '/czat', '/inne'];
    criticalRoutes.forEach((route, index) => {
      setTimeout(() => prefetchRoute(route), index * 100);
    });
  };

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(prefetch);
  } else {
    setTimeout(prefetch, 1000);
  }
};
