'use client';

import { CustomerField, InvoiceItem } from '@/app/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createInvoice, draftInvoice, State } from '@/app/lib/actions';
import { useActionState, useState } from 'react';

export default function Form({
  customers,
  items: availableItems,
  invoiceNumber,
}: {
  customers: CustomerField[];
  items: InvoiceItem[];
  invoiceNumber: number;
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);
  const [items, setItems] = useState([
    { name: '', quantity: 1, price: 0 },
  ]);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const handleItemChange = (
    index: number,
    field: 'name' | 'quantity' | 'price',
    value: string,
  ) => {
    setItems((prev) => {
      const newItems = [...prev];
      const item = { ...newItems[index], [field]: field === 'name' ? value : Number(value) };
      newItems[index] = item;
      return newItems;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { name: '', quantity: 1, price: 0 }]);
  };

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose customer
          </label>
          <div className="relative">
            <select
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby="customer-error"
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>

          <div id="customer-error" aria-live="polite" aria-atomic="true">
            {state.errors?.customerId &&
              state.errors.customerId.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Items */}
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <label className="flex-1 text-sm font-medium">Items</label>
            <span className="w-24 text-sm font-medium">Qty</span>
            <span className="w-28 text-sm font-medium">Price</span>
            <span className="w-28 text-sm font-medium">Total</span>
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="mb-2 flex items-center gap-2">
              <input
                list={`item-options-${idx}`}
                className="block w-full rounded-md border border-gray-200 py-2 px-2 text-sm outline-2"
                value={item.name}
                onChange={(e) => {
                  const name = e.target.value;
                  handleItemChange(idx, 'name', name);
                  const selected = availableItems.find((ai) => ai.name === name);
                  if (selected) {
                    handleItemChange(idx, 'price', String(selected.price / 100));
                  }
                }}
              />
              <datalist id={`item-options-${idx}`}>
                {availableItems.map((ai) => (
                  <option key={ai.id} value={ai.name} />
                ))}
              </datalist>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                className="w-24 rounded-md border border-gray-200 py-2 px-2 text-sm outline-2"
              />
              <input
                type="number"
                step="0.01"
                value={item.price}
                onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                className="w-28 rounded-md border border-gray-200 py-2 px-2 text-sm outline-2"
              />
              <div className="w-28 text-sm">
                {(item.quantity * item.price).toFixed(2)}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
          >
            Add Item
          </button>
        <input type="hidden" name="items" value={JSON.stringify(items)} />
      </div>

      {/* Invoice Amount */}
      <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={totalAmount.toFixed(2)}
                readOnly
                placeholder="Enter USD amount"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="amount-error"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>

          <div id="amount-error" aria-live="polite" aria-atomic="true">
            {state.errors?.amount &&
              state.errors.amount.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Invoice Number */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium" htmlFor="invoiceNumber">
            Invoice #
          </label>
          <input
            id="invoiceNumber"
            name="invoiceNumber"
            type="text"
            value={invoiceNumber ?? ''}
            readOnly
            className="block w-full rounded-md border border-gray-200 py-2 px-2 text-sm"
          />
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="text-white-600 h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 focus:ring-2"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="paid"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Paid <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {state.errors?.status &&
              state.errors.status.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </fieldset>
        <input type="hidden" name="invoiceNumber" value={invoiceNumber} />

        <div aria-live="polite" aria-atomic="true">
          {state.message ? (
            <p className="mt-2 text-sm text-red-500">{state.message}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button formAction={draftInvoice}>Draft Invoice</Button>
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
}
