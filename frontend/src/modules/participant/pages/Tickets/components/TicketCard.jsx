import React from 'react';
import { CalendarDays, MapPin, CheckCircle2, Ticket } from 'lucide-react';

const TicketCard = ({ ticket, onClick }) => {
  const { event } = ticket;
  const isCheckedIn = ticket.checkInStatus === 'CHECKED_IN';

  return (
    <div 
      onClick={() => onClick(ticket)}
      className="bg-white dark:bg-[#0D1628] rounded-2xl border border-slate-200 dark:border-[#1A2942] overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
    >
      {/* Top Banner (Color stripe) */}
      <div className={`h-2 w-full ${event.badgeColor || 'bg-blue-500'}`} />
      
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        
        {/* Header (Status & ID) */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-md">
            {ticket.ticketNumber}
          </div>
          <div className={`text-xs font-bold uppercase tracking-wider ${
            ticket.status === 'CONFIRMED' ? 'text-emerald-600 dark:text-emerald-400' :
            ticket.status === 'CANCELLED' ? 'text-rose-600 dark:text-rose-400' :
            'text-slate-500 dark:text-slate-400'
          }`}>
            {ticket.status}
          </div>
        </div>

        {/* Event Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>

        {/* Date & Location */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <span>{event.dateDisplay}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Participant & Check-in Badge */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#1A2942] flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{ticket.participantName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{ticket.participantRole}</p>
          </div>
          
          {isCheckedIn ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-medium border border-blue-100 dark:border-blue-500/20">
              <CheckCircle2 size={14} />
              Checked In
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-medium border border-amber-100 dark:border-amber-500/20">
              <Ticket size={14} />
              Not Checked In
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TicketCard;
