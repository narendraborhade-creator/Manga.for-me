## 2024-10-22 - Optimize N+1 Query in Update Service
**Learning:** Sequential async API requests in loops cause an O(N) network waterfall delay which is easily parallelizable. When refactoring loops with `Promise.all`, separating the async data fetch from the synchronous state manipulation preserves safety against race conditions.
**Action:** Always identify sequential `await` calls in array iterations as a target for parallel execution via `Promise.all` or `Promise.allSettled`, taking care to process UI state changes or database mutations synchronously afterward.
