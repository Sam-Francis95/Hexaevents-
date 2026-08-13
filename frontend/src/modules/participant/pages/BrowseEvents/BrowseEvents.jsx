import { useEffect, useState } from 'react';
import { CalendarX } from 'lucide-react';
import { EventCard } from '../../components/EventCard';
import { EventFilterBar } from '../../components/EventFilterBar';
import { EmptyState } from '../../../../shared/components/common/EmptyState';
import { Pagination } from '../../../../shared/components/common/Pagination';
import { Skeleton, SkeletonCard } from '../../../../shared/components/common/Skeleton';
import { useDebounce } from '../../../../shared/hooks/useDebounce';
import { getEvents, getEventCategories } from '../../services/eventService';

const PAGE_SIZE = 6;

export default function BrowseEvents() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('');
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    getEventCategories().then((res) => setCategories(res.data || []));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getEvents({ search: debouncedSearch, category, mode, status: 'published' }).then((res) => {
      if (cancelled) return;
      setEvents(res.data || []);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, mode]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, mode]);

  const totalPages = Math.max(Math.ceil(events.length / PAGE_SIZE), 1);
  const pageEvents = events.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Browse events</h1>
        <p className="mt-1 text-sm text-ink-500">Discover and register for upcoming internal events.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full rounded-lg sm:max-w-md" />
          <div className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-24 rounded-full" />
            ))}
          </div>
        </div>
      ) : (
        <EventFilterBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          mode={mode}
          onModeChange={setMode}
          categories={categories}
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : pageEvents.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No events match your filters"
          description="Try a different search term or clear the filters."
          className="rounded-2xl border border-border bg-surface"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageEvents.map((event, i) => (
              <div key={event.id} className="animate-entrance-rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
