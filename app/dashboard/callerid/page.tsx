import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import CallerIdTable from '@/app/ui/callerid/table';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { fetchCallerIdPages } from '@/app/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Caller Id',
};

export default async function Page(props: { searchParams?: Promise<{ query?: string; page?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const totalPages = await fetchCallerIdPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Caller Id</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search call logs..." />
      </div>
      <Suspense key={query + currentPage} fallback={<div>Loading...</div>}>
        <CallerIdTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
