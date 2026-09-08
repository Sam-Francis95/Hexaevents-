import React from 'react';
import { Download, Calendar, X, ExternalLink, MapPin, Clock, CalendarDays, CheckCircle2, Ticket } from 'lucide-react';
import { EVENT_MODE } from '../../../../../shared/utils/constants';

const TicketDetailModal = ({ ticket, isOpen, onClose }) => {
  if (!isOpen || !ticket) return null;

  const { event } = ticket;
  const isOnline = event.mode === EVENT_MODE.ONLINE;
  const isHybrid = event.mode === EVENT_MODE.HYBRID;
  const isOffline = event.mode === EVENT_MODE.OFFLINE;

  // Generate an ICS file for "Add to Calendar"
  const handleAddToCalendar = () => {
    const start = new Date(event.startDate).toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(event.endDate).toISOString().replace(/-|:|\.\d+/g, '');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = () => {
    // Rely on browser print API, styled via @media print in global CSS
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 sm:pb-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm print:hidden"
        onClick={onClose}
      />

      {/* Modal Content - This specific container will be the focus during print */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#0D1628] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-full print:shadow-none print:bg-white print:max-w-none print:h-screen">
        
        {/* Header / Brand Area */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center text-white rounded-t-2xl shrink-0 print:bg-blue-600 print:text-black">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors print:hidden"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md print:bg-slate-200">
              <span className="font-bold text-lg">H</span>
            </div>
            <span className="font-semibold tracking-wide">HEXAEVENTS</span>
          </div>
          
          <h2 className="text-2xl font-bold leading-tight mb-2">{event.title}</h2>
          <p className="text-blue-100 font-medium print:text-slate-700">Official Access Pass</p>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto print:overflow-visible">
          <div className="p-6">
            
            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 dark:bg-white inline-block mb-4 print:border-slate-300">
                {/* 
                  Using an external API for the QR code to avoid heavy frontend dependencies. 
                  In a real prod environment, this would point to a HexaEvents backend endpoint or use a lightweight lib.
                */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qrToken)}&margin=0`} 
                  alt="Ticket QR Code" 
                  className="w-40 h-40 object-contain mix-blend-multiply"
                />
              </div>
              <p className="text-sm font-mono text-slate-500 dark:text-slate-400 print:text-slate-600">
                {ticket.ticketNumber}
              </p>
              
              {ticket.checkInStatus === 'CHECKED_IN' ? (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-medium text-sm border border-blue-200 dark:border-blue-500/20 print:border-slate-300 print:bg-white print:text-black">
                  <CheckCircle2 size={16} />
                  Checked In
                </div>
              ) : (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-medium text-sm border border-amber-200 dark:border-amber-500/20 print:border-slate-300 print:bg-white print:text-black">
                  <Ticket size={16} />
                  Not Checked In
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800 mb-6 border-dashed border-t-2 print:border-slate-300" />

            {/* Participant Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 print:text-slate-500">Participant</p>
                <p className="font-medium text-slate-900 dark:text-white print:text-black">{ticket.participantName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 print:text-slate-500">Access Level</p>
                <p className="font-medium text-slate-900 dark:text-white print:text-black">{ticket.accessLevel}</p>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white print:text-black">{event.dateDisplay}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 print:text-slate-600">Starts at {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white print:text-black">{event.location}</p>
                  {isOffline && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 print:text-slate-600">Show this QR code at the registration desk.</p>}
                  {isHybrid && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 print:text-slate-600">Physical attendance + Online access</p>}
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Actions Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#091225] flex flex-col sm:flex-row gap-3 shrink-0 print:hidden">
          
          {(isOnline || isHybrid) && (
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
              <ExternalLink size={18} />
              Join Event
            </button>
          )}

          <div className="flex gap-3 flex-1">
            <button 
              onClick={handleDownloadPdf}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-[#1A2942] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-medium border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"
            >
              <Download size={18} />
              Download
            </button>
            <button 
              onClick={handleAddToCalendar}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-[#1A2942] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-medium border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"
            >
              <Calendar size={18} />
              Calendar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TicketDetailModal;
