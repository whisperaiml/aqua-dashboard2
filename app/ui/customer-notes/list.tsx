import { CustomerNote } from '@/app/lib/definitions';

export default function CustomerNoteList({ notes }: { notes: CustomerNote[] }) {
  if (!notes.length) {
    return <p className="text-sm text-gray-500">No notes yet.</p>;
  }
  return (
    <ul className="space-y-2">
      {notes.map((note) => (
        <li key={note.id} className="rounded-md border border-gray-200 p-2">
          <p className="whitespace-pre-wrap text-sm">{note.note}</p>
          <p className="mt-1 text-xs text-gray-500">{new Date(note.created_at).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  );
}
