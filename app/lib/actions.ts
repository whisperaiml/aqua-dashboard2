'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { fetchCustomerById, createCustomerNote } from './data';
import { getPayPalAccessToken } from '@/lib/paypal';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ date: true, id: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const ProductFormSchema = z.object({
  name: z.string().min(1, { message: 'Please enter a product name.' }),
  brand: z.string().min(1, { message: 'Please enter a brand.' }),
  description: z.string().min(1, { message: 'Please enter a description.' }),
  producturl: z.string().min(1, { message: 'Please enter a slug.' }),
  sku: z.string().min(1, { message: 'Please enter a SKU.' }),
  imageurl: z.string().min(1, { message: 'Please enter an image URL.' }),
  imagealt: z.string().min(1, { message: 'Please enter image alt text.' }),
  alt1imageurl: z.string().optional(),
  alt1imagealt: z.string().optional(),
  alt2imageurl: z.string().optional(),
  alt2imagealt: z.string().optional(),
  alt3imageurl: z.string().optional(),
  alt3imagealt: z.string().optional(),
  alt4imageurl: z.string().optional(),
  alt4imagealt: z.string().optional(),
  msrp: z.coerce.number().optional(),
  price: z.coerce.number().optional(),
  availability: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  onsale: z.coerce.boolean().optional(),
});

export type ProductState = {
  errors?: Record<string, string[]>;
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  const rawItems = formData.get('items');
  let items: { name: string; quantity: number; price: number }[] = [];
  if (typeof rawItems === 'string') {
    try {
      items = JSON.parse(rawItems);
    } catch (e) {
      items = [];
    }
  }

  const calculatedAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: calculatedAmount,
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql.begin(async (sql) => {
      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
      await Promise.all(
        items.map(
          (item) =>
            sql`
              INSERT INTO invoice_items (name, price)
              VALUES (${item.name}, ${Math.round(item.price * 100)})
              ON CONFLICT (name) DO UPDATE SET price = EXCLUDED.price;
            `,
        ),
      );
    });
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function draftInvoice(formData: FormData) {
  const rawItems = formData.get('items');
  let items: { name: string; quantity: number; price: number }[] = [];
  if (typeof rawItems === 'string') {
    try {
      items = JSON.parse(rawItems);
    } catch {
      items = [];
    }
  }

  const customerId = formData.get('customerId');
  const invoiceNumber = formData.get('invoiceNumber');

  if (typeof customerId !== 'string' || typeof invoiceNumber !== 'string') {
    return { message: 'Missing customer or invoice number.' } as State;
  }

  try {
    const customer = await fetchCustomerById(customerId);
    const body = {
      detail: {
        invoice_number: invoiceNumber,
        currency_code: 'USD',
      },
      primary_recipients: [
        {
          billing_info: {
            email_address: customer?.email,
            name: { given_name: customer?.name },
          },
        },
      ],
      items: items.map((item) => ({
        name: item.name,
        quantity: String(item.quantity),
        unit_amount: { currency_code: 'USD', value: item.price.toFixed(2) },
      })),
    };

    const apiBase = process.env.PAYPAL_API_BASE;
    let accessToken: string | undefined = process.env.PAYPAL_ACCESS_TOKEN;

    if (!accessToken) {
      accessToken = await getPayPalAccessToken() ?? undefined;
    }

    if (!apiBase || !accessToken) {
      console.error('Missing PayPal configuration.');
      return { message: 'PayPal is not configured.' } as State;
    }

    const res = await fetch(`${apiBase}/v2/invoicing/invoices`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('PayPal error:', data);
      return { message: 'Failed to create PayPal invoice.' } as State;
    }

    const data = await res.json();
    console.log('Created PayPal invoice', data.id);
    return { message: null } as State;
  } catch (error) {
    console.error('PayPal invoice error:', error);
    return { message: 'PayPal request failed.' } as State;
  }
}

export async function createProduct(prevState: ProductState, formData: FormData) {
  const validatedFields = ProductFormSchema.safeParse({
    name: formData.get('name'),
    brand: formData.get('brand'),
    description: formData.get('description'),
    producturl: formData.get('producturl'),
    sku: formData.get('sku'),
    imageurl: formData.get('imageurl'),
    imagealt: formData.get('imagealt'),
    alt1imageurl: formData.get('alt1imageurl'),
    alt1imagealt: formData.get('alt1imagealt'),
    alt2imageurl: formData.get('alt2imageurl'),
    alt2imagealt: formData.get('alt2imagealt'),
    alt3imageurl: formData.get('alt3imageurl'),
    alt3imagealt: formData.get('alt3imagealt'),
    alt4imageurl: formData.get('alt4imageurl'),
    alt4imagealt: formData.get('alt4imagealt'),
    msrp: formData.get('msrp'),
    price: formData.get('price'),
    availability: formData.get('availability'),
    featured: formData.get('featured'),
    active: formData.get('active'),
    onsale: formData.get('onsale'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Product.',
    };
  }

  const {
    name,
    brand,
    description,
    producturl,
    sku,
    imageurl,
    imagealt,
    alt1imageurl,
    alt1imagealt,
    alt2imageurl,
    alt2imagealt,
    alt3imageurl,
    alt3imagealt,
    alt4imageurl,
    alt4imagealt,
    msrp,
    price,
    availability,
    featured,
    active,
    onsale,
  } = validatedFields.data;

  try {
    await sql`
      INSERT INTO products_water (
        name,
        brand,
        description,
        slug,
        sku,
        image_url,
        image_alt,
        alt1_url,
        alt1_alt,
        alt2_url,
        alt2_alt,
        alt3_url,
        alt3_alt,
        alt4_url,
        alt4_alt,
        msrp,
        price,
        availability,
        featured,
        active,
        onsale
      ) VALUES (
        ${name},
        ${brand},
        ${description},
        ${producturl},
        ${sku},
        ${imageurl},
        ${imagealt},
        ${alt1imageurl ?? null},
        ${alt1imagealt ?? null},
        ${alt2imageurl ?? null},
        ${alt2imagealt ?? null},
        ${alt3imageurl ?? null},
        ${alt3imagealt ?? null},
        ${alt4imageurl ?? null},
        ${alt4imagealt ?? null},
        ${msrp ?? null},
        ${price ?? null},
        ${availability ?? null},
        ${featured ?? false},
        ${active ?? false},
        ${onsale ?? false}
      )
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Create Product.' };
  }

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

export async function addCustomerNote(formData: FormData): Promise<void> {
  const customerId = formData.get('customerId');
  const note = formData.get('note');

  if (
    typeof customerId !== 'string' ||
    typeof note !== 'string' ||
    note.trim() === ''
  ) {
    throw new Error('Missing Fields. Failed to create note.');
  }

  try {
    await createCustomerNote(customerId, note);
  } catch {
    throw new Error('Database Error: Failed to create note.');
  }

  revalidatePath(`/dashboard/customers/${customerId}/notes`);
  redirect(`/dashboard/customers/${customerId}/notes`);
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
