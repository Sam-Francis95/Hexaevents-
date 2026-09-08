import React, { useState, useMemo } from 'react';
import { Search, Ticket as TicketIcon, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_TICKETS } from '../../../../shared/utils/mockData';
import { ROUTES } from '../../../../shared/utils/constants';
import TicketCard from './components/TicketCard';
import TicketDetailModal from './components/TicketDetailModal';

const Tickets = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const filters = ['All', 'Upcoming', 'Past', 'Checked In'];

  const filteredTickets = useMemo(() => {
    return MOCK_TICKETS.filter((ticket) => {
      // Search filter
      const searchMatch = 
        ticket.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!searchMatch) return false;

      // Category filter (simplistic date logic for mock data)
      const now = new Date();
      const eventDate = new Date(ticket.event.startDate);
      const isPast = eventDate < now;
      const isCheckedIn = ticket.checkInStatus === 'CHECKED_IN';

      switch (activeFilter) {
        case 'Upcoming':
          return !isPast;
        case 'Past':
          return isPast;
        case 'Checked In':
          return isCheckedIn;
        case 'All':
        default:
          return true;
      }
    });
  }, [activeFilter, searchQuery]);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">My Tickets</h1>
        <p className="text-slate-600 dark:text-slate-400">Your event passes and digital entry tickets.</p>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto hide-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#0D1628] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1A2942] hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets or events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-[#1A2942] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-shadow"
          />
        </div>
      </div>

      {/* Ticket Grid or Empty State */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onClick={setSelectedTicket} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0D1628] rounded-2xl border border-slate-200 dark:border-[#1A2942] p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
            <TicketIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {searchQuery ? 'No tickets found matching your search' : "You don't have any event tickets yet"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
            {searchQuery 
              ? 'Try adjusting your search term or selecting a different filter.'
              : 'Register for an event to receive your ticket after approval.'}
          </p>
          
          {!searchQuery && (
            <button 
              onClick={() => navigate(ROUTES.PARTICIPANT.EVENTS)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
            >
              <Compass className="w-5 h-5" />
              Explore Events
            </button>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <TicketDetailModal 
        ticket={selectedTicket} 
        isOpen={!!selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
      />

    </div>
  );
};

export default Tickets;
