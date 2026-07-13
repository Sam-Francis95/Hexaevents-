import { Award, Download, Eye, Share2 } from 'lucide-react';
import { formatDate } from '../../../shared/utils/formatters';
import { useToast } from '../../../shared/hooks/useToast';

export function CertificateCard({ certificate }) {
  const toast = useToast();

  function handleShare() {
    navigator.clipboard?.writeText(`${window.location.origin}/certificates/${certificate.id}`);
    toast.info('Certificate link copied to clipboard.');
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-accent-500 to-accent-700">
        <Award className="size-10 text-white/90" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-sm font-medium text-ink-900 line-clamp-2">{certificate.eventTitle}</h3>
          <p className="mt-1 text-xs font-mono text-ink-300">Issued {formatDate(certificate.issueDate)}</p>
        </div>
        <div className="mt-auto flex items-center gap-1.5 pt-1">
          <a
            href={certificate.downloadUrl}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-accent-600"
          >
            <Download className="size-3.5" /> Download
          </a>
          <a
            href={certificate.downloadUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="View certificate"
            className="flex size-8 items-center justify-center rounded-lg border border-border-strong text-ink-700 hover:bg-canvas"
          >
            <Eye className="size-3.5" />
          </a>
          <button
            onClick={handleShare}
            aria-label="Share certificate"
            className="flex size-8 items-center justify-center rounded-lg border border-border-strong text-ink-700 hover:bg-canvas"
          >
            <Share2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
