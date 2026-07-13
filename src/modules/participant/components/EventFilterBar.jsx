import { SlidersHorizontal } from 'lucide-react';
import { SearchInput } from '../../../shared/components/common/SearchInput';
import { Dropdown } from '../../../shared/components/common/Dropdown';

const MODE_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'In-person' },
  { value: 'hybrid', label: 'Hybrid' },
];

export function EventFilterBar({ search, onSearchChange, category, onCategoryChange, mode, onModeChange, categories = [] }) {
  const categoryOptions = categories.map((c) => ({ value: c, label: c }));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput value={search} onChange={onSearchChange} placeholder="Search events by title or description…" className="sm:flex-1" />
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="hidden size-4 text-ink-300 sm:block" />
        <Dropdown
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={categoryOptions}
          placeholder="All categories"
          containerClassName="w-40"
        />
        <Dropdown
          value={mode}
          onChange={(e) => onModeChange(e.target.value)}
          options={MODE_OPTIONS}
          placeholder="All formats"
          containerClassName="w-36"
        />
      </div>
    </div>
  );
}
