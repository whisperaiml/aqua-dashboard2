import { Metadata } from 'next';
import { lusitana } from '@/app/ui/fonts';
import Pagination from '@/app/ui/invoices/pagination';
import CustomerIntakeTable from '@/app/ui/customer-intake/table';
import { fetchCustomerIntakePages } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Customer Intake',
};

export default async function Page(props: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;

  const totalPages = await fetchCustomerIntakePages();

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} text-2xl`}>Customer Intake</h1>
      <CustomerIntakeTable currentPage={currentPage} />
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
