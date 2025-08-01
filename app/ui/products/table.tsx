import { ProductsTable } from '@/app/lib/definitions'
import { fetchFilteredProducts } from '@/app/lib/data'

export default async function ProductsTableComponent({
  query,
  currentPage,
}: {
  query: string
  currentPage: number
}) {
  const products = await fetchFilteredProducts(query, currentPage)

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium">
                  Name
                </th>
                <th scope="col" className="px-4 py-5 font-medium">
                  Brand
                </th>
                <th scope="col" className="px-4 py-5 font-medium">
                  Price
                </th>
                <th scope="col" className="px-4 py-5 font-medium">
                  SKU
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none"
                >
                  <td className="whitespace-nowrap px-4 py-3">{product.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{product.brand}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {product.price === null
                      ? '-'
                      : Number(product.price).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{product.sku}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
