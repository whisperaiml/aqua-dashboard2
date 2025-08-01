import { fetchCustomerNotes } from '@/app/lib/data';
import CustomerNoteForm from '@/app/ui/customer-notes/form';
import CustomerNoteList from '@/app/ui/customer-notes/list';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Notes',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const customerId = params.id;
  const notes = await fetchCustomerNotes(customerId);
  return (
    <div className="space-y-6">
      <CustomerNoteForm customerId={customerId} />
      <CustomerNoteList notes={notes} />
    </div>
  );
}
