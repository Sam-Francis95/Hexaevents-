import { cn } from '../../utils/cn';

/**
 * @param {{columns: {key:string, header:string, render?:(row:any)=>any, className?:string}[], rows: any[], keyField?: string, emptyState?: any}} props
 */
export function Table({ columns, rows, keyField = 'id', emptyState, className }) {
  if (!rows || rows.length === 0) {
    return <div className="rounded-2xl border border-border bg-surface py-12">{emptyState}</div>;
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-surface', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-canvas">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-ink-500', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[keyField]} className="border-b border-border last:border-0 hover:bg-canvas/60">
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3 text-ink-700', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
