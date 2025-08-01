import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { invoices, customers, revenue, users, invoiceItems } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role VARCHAR(255) NOT NULL DEFAULT 'user'
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password, role)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword}, ${
        user.role})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

async function seedInvoiceItems() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      price INT NOT NULL
    );
  `;

  const insertedItems = await Promise.all(
    invoiceItems.map(
      (item) => sql`
        INSERT INTO invoice_items (name, price)
        VALUES (${item.name}, ${item.price})
        ON CONFLICT (name) DO UPDATE SET price = EXCLUDED.price;
      `,
    ),
  );

  return insertedItems;
}

async function seedTwilioLogs() {
  await sql`
    CREATE TABLE IF NOT EXISTS twilio_logs (
      id SERIAL PRIMARY KEY,
      from_number TEXT,
      to_number TEXT,
      call_sid TEXT,
      direction TEXT,
      caller_city TEXT,
      caller_state TEXT,
      caller_zip TEXT,
      caller_name TEXT,
      caller_type TEXT,
      line_type TEXT,
      carrier_name TEXT,
      carrier_type TEXT,
      mcc TEXT,
      mnc TEXT,
      addon_city TEXT,
      addon_state TEXT,
      addon_zip TEXT,
      addon_latitude DOUBLE PRECISION,
      addon_longitude DOUBLE PRECISION,
      is_valid BOOLEAN,
      addons JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
}

async function seedTwilioRawLogs() {
  await sql`
    CREATE TABLE IF NOT EXISTS twilio_raw_logs (
      id SERIAL PRIMARY KEY,
      payload TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
}

export async function GET() {
  try {
    const result = await sql.begin((sql) => [
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedInvoiceItems(),
      seedRevenue(),
      seedTwilioLogs(),
      seedTwilioRawLogs(),
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
