import { fetchFilteredCallerIdLogs } from '@/app/lib/data';
import { CallerIdLog } from '@/app/lib/definitions';
import RawDataCell from './raw-data-cell';
import CallSidCell from './call-sid-cell';

export default async function CallerIdTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const logs = await fetchFilteredCallerIdLogs(query, currentPage);
  const columns: (keyof CallerIdLog)[] = [
    'id',
    'call_sid',
    'from_number',
    'to_number',
    'direction',
    'caller_city',
    'caller_state',
    'caller_zip',
    'name',
    'timestamp',
    'raw_data',
  ];

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile layout */}
          <div className="md:hidden">
            {logs.map((log) => (
              <div
                key={log.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <p className="font-medium">
                    {log.from_number ?? '-'} → {log.to_number ?? '-'}
                  </p>
                  <p className="text-xs text-gray-500">{log.timestamp}</p>
                </div>
                <div className="pt-2 text-sm">
                  <p>
                    <span className="font-medium">Direction:</span>{' '}
                    {log.direction ?? '-'}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    {log.call_status ?? '-'}
                  </p>
                  <p>
                    <span className="font-medium">Call Sid:</span>{' '}
                    <CallSidCell sid={log.call_sid} />
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{' '}
                    {[log.caller_city, log.caller_state]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </p>
                  <p>
                    <span className="font-medium">Name:</span>{' '}
                    {log.name ?? '-'}
                  </p>
                  <div className="mt-2">
                    <RawDataCell data={log.raw_data} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="overflow-x-auto md:block">
            <table className="hidden min-w-full text-gray-900 text-xs md:table">
              <thead className="rounded-lg text-left font-normal">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-2 py-3 font-medium capitalize"
                    >
                      {column.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {logs.map((log: CallerIdLog) => (
                  <tr
                    key={log.id}
                    className="border-b last-of-type:border-none"
                  >
                    {columns.map((column) => (
                      <td key={column} className="whitespace-nowrap px-2 py-2 break-all">
                        {column === 'raw_data' ? (
                          <RawDataCell data={log.raw_data} />
                        ) : column === 'call_sid' ? (
                          <CallSidCell sid={log.call_sid} />
                        ) : (
                          String((log as any)[column] ?? '')
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
