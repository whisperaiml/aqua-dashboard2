'use client';
import { addCustomerNote } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';

export default function CustomerNoteForm({ customerId }: { customerId: string }) {
  return (
    <form action={addCustomerNote} className="space-y-2">
      <input type="hidden" name="customerId" value={customerId} />
      <textarea
        name="note"
        className="w-full rounded-md border border-gray-200 p-2 text-sm"
        rows={3}
        placeholder="Enter note..."
      />
      <div>
        <Button type="submit">Add Note</Button>
      </div>
    </form>
  );
}
