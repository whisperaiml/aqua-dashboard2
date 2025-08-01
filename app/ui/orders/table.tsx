import { fetchFilteredOrders } from "@/app/lib/data";
import { OrdersTable as OrderType } from "@/app/lib/definitions";

export default async function OrdersTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const orders = await fetchFilteredOrders(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium">
                  First Name
                </th>
                <th scope="col" className="px-4 py-5 font-medium">
                  Last Name
                </th>
                <th scope="col" className="px-4 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-4 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-4 py-5 font-medium">
                  Invoice #
                </th>
                <th scope="col" className="px-4 py-5 font-medium">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {orders.map((order: OrderType) => {
                const [firstName, ...lastNameParts] = order.name.split(' ');
                const lastName = lastNameParts.join(' ');
                return (
                  <tr
                    key={order.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none"
                  >
                    <td className="whitespace-nowrap px-4 py-3">{firstName}</td>
                    <td className="whitespace-nowrap px-4 py-3">{lastName}</td>
                    <td className="whitespace-nowrap px-4 py-3">{order.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {Number(order.amount).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {order.invoice_number}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
