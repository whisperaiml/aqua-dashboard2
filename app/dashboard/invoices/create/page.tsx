import {
  fetchCustomers,
  fetchInvoiceItems,
  fetchNextInvoiceNumber,
} from '@/app/lib/data';
import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Invoice',
};

export default async function Page() {
  const [customers, items, nextNumber] = await Promise.all([
    fetchCustomers(),
    fetchInvoiceItems(),
    fetchNextInvoiceNumber(),
  ]);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} items={items} invoiceNumber={nextNumber} />
    </main>
  );
}
