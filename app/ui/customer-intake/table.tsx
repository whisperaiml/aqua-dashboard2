import { fetchCustomerIntakeColumns, fetchCustomerIntakeRows } from '@/app/lib/data';
import { CustomerIntake } from '@/app/lib/definitions';

export default async function CustomerIntakeTable({
  currentPage,
}: {
  currentPage: number;
}) {
  const columns = await fetchCustomerIntakeColumns();
  const rows = await fetchCustomerIntakeRows(currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-x-auto rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                {columns.map((column) => (
                  <th key={column} scope="col" className="px-4 py-5 font-medium capitalize">
                    {column.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {rows.map((row: CustomerIntake) => (
                <tr key={row.id} className="border-b py-3 text-sm last-of-type:border-none">
                  {columns.map((column) => (
                    <td key={column} className="whitespace-nowrap px-4 py-3">
                      {String((row as any)[column] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
