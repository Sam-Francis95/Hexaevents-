import eventsData from '../data/events.json';
import { mockDelay } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

/**
 * @param {{category?:string, mode?:string, status?:string, search?:string}} filters
 */
export async function getEvents(filters = {}) {
  await mockDelay();
  let result = [...eventsData];

  if (filters.category) result = result.filter((e) => e.category === filters.category);
  if (filters.mode) result = result.filter((e) => e.mode === filters.mode);
  if (filters.status) result = result.filter((e) => e.status === filters.status);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
    );
  }

  return ok(result);
}

export async function getEventById(id) {
  await mockDelay();
  const event = eventsData.find((e) => e.id === id);
  if (!event) return fail('Event not found.', 'NOT_FOUND');
  return ok(event);
}

export async function getEventCategories() {
  await mockDelay(100);
  const categories = [...new Set(eventsData.map((e) => e.category))];
  return ok(categories);
}
