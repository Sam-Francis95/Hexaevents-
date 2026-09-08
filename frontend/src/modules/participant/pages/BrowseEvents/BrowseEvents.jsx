import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Calendar as CalendarIcon, MapPin, Bookmark, ChevronDown,
  SlidersHorizontal, X, Trophy, Users, Filter, Grid3X3, List
} from 'lucide-react';
import { useDebounce } from '../../../../shared/hooks/useDebounce';
import { getEvents } from '../../services/eventService';
import { ROUTES, EVENT_STATUS } from '../../../../shared/utils/constants';
import { formatDate } from '../../../../shared/utils/formatters';
import { MOCK_EVENTS } from '../../../../shared/utils/mockData';
import { cn } from '../../../../shared/utils/cn';

const CATEGORIES = ['All', 'Hackathons', 'Ideathons', 'Competitions', 'Workshops', 'Webinars', 'Conferences', 'Bootcamps', 'Challenges'];

const CAT_FILTER_MAP = {
  Hackathons: 'HACKATHON', Ideathons: 'IDEATHON', Competitions: 'COMPETITION',
  Workshops: 'WORKSHOP', Webinars: 'WEBINAR', Conferences: 'CONFERENCE',
  Bootcamps: 'BOOTCAMP', Challenges: 'CHALLENGE',
};

const CAT_STYLE = {
  HACKATHON:   { bg: 'bg-[#0056D2]', text: 'text-white' },
  IDEATHON:    { bg: 'bg-[#7C3AED]', text: 'text-white' },
  COMPETITION: { bg: 'bg-[#0891B2]', text: 'text-white' },
  WORKSHOP:    { bg: 'bg-[#16A34A]', text: 'text-white' },
  CHALLENGE:   { bg: 'bg-[#EA580C]', text: 'text-white' },
  BOOTCAMP:    { bg: 'bg-[#DB2777]', text: 'text-white' },
  WEBINAR:     { bg: 'bg-[#0369A1]', text: 'text-white' },
  CONFERENCE:  { bg: 'bg-[#4F46E5]', text: 'text-white' },
  default:     { bg: 'bg-ink-700',   text: 'text-white' },
};
function catStyle(cat) { return CAT_STYLE[String(cat).toUpperCase()] || CAT_STYLE.default; }

const PAGE_SIZE = 9;

export default function BrowseEvents() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modeFilter, setModeFilter] = useState([]);
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [gridView, setGridView] = useState(true);
  const [sortBy, setSortBy] = useState('recommended');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getEvents({ status: EVENT_STATUS.PUBLISHED }).then((res) => {
      if (cancelled) return;
      const apiEvents = res.data || [];
      setEvents(apiEvents.length > 0 ? apiEvents : MOCK_EVENTS);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { setPage(1); }, [debouncedSearch, selectedCategory, modeFilter, sortBy]);

  const filtered = useMemo(() => {
    let out = [...events];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      out = out.filter((e) => e.title.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q));
    }
    if (selectedCategory !== 'All') {
      const catKey = CAT_FILTER_MAP[selectedCategory];
      if (catKey) out = out.filter((e) => String(e.category).toUpperCase() === catKey);
    }
    if (modeFilter.length) {
      out = out.filter((e) => modeFilter.includes(e.mode));
    }
    if (sortBy === 'newest') out.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    if (sortBy === 'soonest') out.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    if (sortBy === 'popular') out.sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0));
    return out;
  }, [events, debouncedSearch, selectedCategory, modeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageEvents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => { setSearch(''); setSelectedCategory('All'); setModeFilter([]); setSortBy('recommended'); };
  const hasFilters = search || selectedCategory !== 'All' || modeFilter.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      {/* Hero Search Header */}
      <div className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#0C2146_0%,#0E3175_40%,#1A1060_100%)] p-6 text-white shadow-[0_8px_32px_rgba(0,86,210,0.2)] sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 size-48 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-[32px]">Explore Events</h1>
          <p className="mb-6 text-base text-sky-100/80">Find your next opportunity to build, learn, and win.</p>
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hackathons, ideathons, competitions..."
              className="h-[52px] w-full rounded-2xl border-0 bg-white pl-12 pr-12 text-base text-ink-900 placeholder:text-ink-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-[#0056D2]/30"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-ink-900/10 p-1 text-ink-500 hover:bg-ink-900/20">
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all',
              selectedCategory === cat
                ? 'bg-[#0056D2] text-white shadow-[0_4px_14px_rgba(0,86,210,0.35)]'
                : 'border border-border bg-surface text-ink-700 hover:border-[#0056D2]/30 hover:text-[#0056D2]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Filter Sidebar (Desktop) */}
        <div className="hidden w-[240px] shrink-0 flex-col gap-4 lg:flex">
          <div className="rounded-[18px] border border-border bg-surface p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink-900">
                <Filter className="size-4" /> Filters
              </h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-[11px] font-semibold text-[#0056D2] dark:text-blue-400">Clear all</button>
              )}
            </div>

            {/* Format */}
            <div className="mb-5">
              <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">Format</h4>
              {[
                { label: 'Online', value: 'online' },
                { label: 'In-person', value: 'offline' },
                { label: 'Hybrid', value: 'hybrid' },
              ].map(({ label, value }) => (
                <label key={value} className="flex cursor-pointer items-center gap-2.5 py-1.5">
                  <input
                    type="checkbox"
                    checked={modeFilter.includes(value)}
                    onChange={() => setModeFilter((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value])}
                    className="size-4 rounded border-border text-[#0056D2] accent-[#0056D2]"
                  />
                  <span className="text-sm text-ink-700">{label}</span>
                </label>
              ))}
            </div>

            {/* Sort */}
            <div>
              <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">Sort by</h4>
              {[
                { label: 'Recommended', value: 'recommended' },
                { label: 'Most popular', value: 'popular' },
                { label: 'Starting soon', value: 'soonest' },
                { label: 'Newest first', value: 'newest' },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value)}
                  className={cn(
                    'flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    sortBy === value ? 'bg-blue-50 text-[#0056D2] dark:bg-blue-500/10 dark:text-blue-400' : 'text-ink-700 hover:bg-canvas'
                  )}
                >
                  {sortBy === value && <span className="mr-2 size-1.5 rounded-full bg-[#0056D2] dark:bg-blue-400" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink-500">
              Showing <span className="font-bold text-ink-900">{filtered.length}</span> opportunities
              {hasFilters && <button onClick={clearFilters} className="ml-2 text-[#0056D2] underline">Clear filters</button>}
            </p>
            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button onClick={() => setFilterOpen(!filterOpen)} className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink-700 shadow-sm hover:bg-ink-900/5 lg:hidden">
                <SlidersHorizontal className="size-4" /> Filters
                {hasFilters && <span className="flex size-2 rounded-full bg-[#0056D2]" />}
              </button>
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-xl border border-border bg-surface py-1.5 pl-3 pr-8 text-sm font-medium text-ink-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0056D2]"
                >
                  <option value="recommended">Recommended</option>
                  <option value="popular">Most popular</option>
                  <option value="soonest">Starting soon</option>
                  <option value="newest">Newest</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-400" />
              </div>
              {/* Grid/List toggle */}
              <div className="flex rounded-xl border border-border bg-surface p-0.5">
                <button onClick={() => setGridView(true)} className={cn('flex size-8 items-center justify-center rounded-lg transition-colors', gridView ? 'bg-[#0056D2] text-white' : 'text-ink-400 hover:text-ink-900')}>
                  <Grid3X3 className="size-4" />
                </button>
                <button onClick={() => setGridView(false)} className={cn('flex size-8 items-center justify-center rounded-lg transition-colors', !gridView ? 'bg-[#0056D2] text-white' : 'text-ink-400 hover:text-ink-900')}>
                  <List className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile filter panel */}
          {filterOpen && (
            <div className="rounded-[18px] border border-border bg-surface p-4 shadow-sm lg:hidden">
              <div className="flex flex-wrap gap-3">
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">Format</p>
                  <div className="flex gap-2">
                    {['online', 'offline', 'hybrid'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setModeFilter((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])}
                        className={cn('rounded-full px-3 py-1 text-xs font-semibold capitalize', modeFilter.includes(v) ? 'bg-[#0056D2] text-white' : 'border border-border text-ink-700')}
                      >
                        {v === 'offline' ? 'In-person' : v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Event Grid */}
          {isLoading ? (
            <div className={cn('gap-5', gridView ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col')}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-[18px] border border-border bg-surface" />
              ))}
            </div>
          ) : pageEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-border bg-surface py-16 text-center">
              <Search className="mb-4 size-12 text-ink-200" />
              <h3 className="mb-1 text-lg font-bold text-ink-900">No events found</h3>
              <p className="text-sm text-ink-400">Try adjusting your search or filters.</p>
              <button onClick={clearFilters} className="mt-4 rounded-xl bg-[#0056D2] px-5 py-2 text-sm font-semibold text-white">
                Clear all filters
              </button>
            </div>
          ) : gridView ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pageEvents.map((event, i) => (
                <div key={event.id} className="animate-entrance-rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                  <EventGridCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pageEvents.map((event, i) => (
                <div key={event.id} className="animate-entrance-rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                  <EventListCard event={event} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => { setPage((p) => p - 1); window.scrollTo(0, 0); }}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-700 shadow-sm disabled:opacity-40 hover:bg-ink-900/5"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                    className={cn('flex size-9 items-center justify-center rounded-xl text-sm font-bold', p === page ? 'bg-[#0056D2] text-white' : 'border border-border bg-surface text-ink-700 hover:bg-ink-900/5')}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => { setPage((p) => p + 1); window.scrollTo(0, 0); }}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-700 shadow-sm disabled:opacity-40 hover:bg-ink-900/5"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventGridCard({ event }) {
  const { bg: catBg, text: catText } = catStyle(event.category);
  const seatsLeft = Math.max(0, (event.capacity || 500) - (event.registeredCount || 0));
  const seatsPercent = Math.min(100, Math.round(((event.registeredCount || 0) / (event.capacity || 500)) * 100));

  return (
    <div className="group flex flex-col overflow-hidden rounded-[18px] border border-border bg-surface shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,86,210,0.12)]">
      {/* Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-ink-900/5">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0056D2,#7C3AED)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className={cn('absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', catBg, catText)}>
          {event.category}
        </span>
        <button className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/70">
          <Bookmark className="size-4" />
        </button>
        {event.prize && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-1 text-[10px] font-bold text-amber-900">
            <Trophy className="size-3" /> {event.prize}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1 line-clamp-2 text-[15px] font-bold leading-tight text-ink-900 transition-colors group-hover:text-[#0056D2]">
          {event.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-ink-400">
          {event.description || 'Join this exciting competition and build amazing solutions.'}
        </p>

        <div className="mb-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[12px] text-ink-500">
            <CalendarIcon className="size-3.5 shrink-0 text-ink-300" />
            <span className="font-medium">{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-ink-500">
            <MapPin className="size-3.5 shrink-0 text-ink-300" />
            <span className="font-medium">{event.mode === 'online' ? '🌐 Online' : event.location || 'TBA'}</span>
          </div>
          {event.teamSizeLimit && (
            <div className="flex items-center gap-2 text-[12px] text-ink-500">
              <Users className="size-3.5 shrink-0 text-ink-300" />
              <span className="font-medium">Team: {event.teamSizeLimit.min}–{event.teamSizeLimit.max} members</span>
            </div>
          )}
        </div>

        {/* Seat fill */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-medium text-ink-400">{seatsLeft} seats left</span>
            <span className={cn('text-[10px] font-bold', seatsPercent >= 90 ? 'text-red-500' : seatsPercent >= 70 ? 'text-amber-500' : 'text-green-600')}>
              {seatsPercent}% filled
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-canvas">
            <div
              className={cn('h-full rounded-full', seatsPercent >= 90 ? 'bg-red-500' : seatsPercent >= 70 ? 'bg-amber-500' : 'bg-[#0056D2]')}
              style={{ width: `${seatsPercent}%` }}
            />
          </div>
        </div>

        <Link
          to={ROUTES.PARTICIPANT.EVENT_DETAILS(event.id)}
          className="mt-auto flex w-full items-center justify-center rounded-xl bg-[#0056D2] py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0048B0] active:scale-[0.98]"
        >
          Register Now
        </Link>
      </div>
    </div>
  );
}

function EventListCard({ event }) {
  const { bg: catBg, text: catText } = catStyle(event.category);
  const seatsLeft = Math.max(0, (event.capacity || 500) - (event.registeredCount || 0));

  return (
    <div className="group flex overflow-hidden rounded-[16px] border border-border bg-surface shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="relative h-auto w-28 shrink-0 overflow-hidden sm:w-40">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.title} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0056D2,#7C3AED)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className={cn('absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', catBg, catText)}>
          {event.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="mb-1 text-sm font-bold text-ink-900 transition-colors group-hover:text-[#0056D2]">{event.title}</h3>
          <p className="line-clamp-1 text-xs text-ink-400">{event.description}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1 text-[11px] text-ink-500">
            <CalendarIcon className="size-3.5" /> {formatDate(event.startDate)}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-ink-500">
            <MapPin className="size-3.5" /> {event.mode === 'online' ? 'Online' : event.location}
          </span>
          {event.prize && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
              <Trophy className="size-3.5" /> {event.prize}
            </span>
          )}
          <span className="text-[11px] text-ink-400">{seatsLeft} seats left</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center pr-4">
        <Link
          to={ROUTES.PARTICIPANT.EVENT_DETAILS(event.id)}
          className="rounded-xl bg-[#0056D2] px-4 py-2 text-sm font-bold text-white transition-all hover:bg-[#0048B0]"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
