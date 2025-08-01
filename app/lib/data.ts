import postgres from "postgres";
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoiceItem,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
  ProductsTable,
  OrdersTable,
  CustomerIntake,
  CallerIdLog,
  CustomerNote,
} from "./definitions";
import { formatCurrency } from "./utils";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const ORDERS_PER_PAGE = 5;

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    // console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql<{ count: string }[]>`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql<{ count: string }[]>`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql<{ paid: number | null; pending: number | null }[]>`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0]?.count ?? "0");
    const numberOfCustomers = Number(data[1][0]?.count ?? "0");
    const totalPaidInvoices = formatCurrency(data[2][0]?.paid ?? 0);
    const totalPendingInvoices = formatCurrency(data[2][0]?.pending ?? 0);

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchCustomerById(id: string) {
  try {
    const data = await sql<{ name: string; email: string }[]>`
      SELECT name, email FROM customers WHERE id = ${id}
    `;
    return data[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer.");
  }
}

export async function fetchInvoiceItems() {
  try {
    const items = await sql<InvoiceItem[]>`
      SELECT id, name, price
      FROM invoice_items
      ORDER BY name ASC
    `;
    return items;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice items.");
  }
}

export async function fetchNextInvoiceNumber() {
  try {
    const result = await sql<{ count: string }[]>`SELECT COUNT(*) FROM invoices`;
    const count = Number(result[0].count ?? '0');
    const yearPrefix = new Date().getFullYear().toString().slice(-2);
    const base = Number(`${yearPrefix}0100`);
    return base + count * 6;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch next invoice number.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType[]>`
                SELECT
                  customers.id,
                  customers.name,
                  customers.email,
                  customers.image_url,
                  COUNT(invoices.id) AS total_invoices,
                  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
                  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
                FROM customers
                LEFT JOIN invoices ON customers.id = invoices.customer_id
                WHERE
                  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
                GROUP BY customers.id, customers.name, customers.email, customers.image_url
                ORDER BY customers.name ASC
          `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

export async function fetchFilteredProducts(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const products = await sql<ProductsTable[]>`
      SELECT id, name, brand, sku, price
      FROM products
      WHERE
        name ILIKE ${`%${query}%`} OR
        brand ILIKE ${`%${query}%`} OR
        sku ILIKE ${`%${query}%`} OR
        price::text ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    return products;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch products.");
  }
}

export async function fetchProductsPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*) FROM products WHERE
      name ILIKE ${`%${query}%`} OR
      brand ILIKE ${`%${query}%`} OR
      sku ILIKE ${`%${query}%`} OR
      price::text ILIKE ${`%${query}%`}
    `;
    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of products.");
  }
}

export async function fetchFilteredOrders(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ORDERS_PER_PAGE;
  try {
    const orders = await sql<OrdersTable[]>`
      SELECT id, name, email, amount, order_id, capture_id, capture_status, invoice_number, created_at
      FROM orders
      WHERE
        name ILIKE ${`%${query}%`} OR
        email ILIKE ${`%${query}%`} OR
        order_id ILIKE ${`%${query}%`} OR
        capture_id ILIKE ${`%${query}%`} OR
        capture_status ILIKE ${`%${query}%`} OR
        invoice_number::text ILIKE ${`%${query}%`}
      ORDER BY created_at DESC
      LIMIT ${ORDERS_PER_PAGE} OFFSET ${offset}
    `;
    return orders;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch orders.");
  }
}

export async function fetchOrdersPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*) FROM orders WHERE
      name ILIKE ${`%${query}%`} OR
      email ILIKE ${`%${query}%`} OR
      order_id ILIKE ${`%${query}%`} OR
      capture_id ILIKE ${`%${query}%`} OR
      capture_status ILIKE ${`%${query}%`} OR
      invoice_number::text ILIKE ${`%${query}%`}
    `;
    const totalPages = Math.ceil(Number(data[0].count) / ORDERS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of orders.");
  }
}

const CUSTOMER_INTAKE_ROWS_PER_PAGE = 5;

export async function fetchCustomerIntakeColumns() {
  try {
    const data = await sql<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'customer_intake'
      ORDER BY ordinal_position
    `;
    return data
      .map((row) => row.column_name)
      .filter((column) => column !== 'submission_date');
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch customer intake columns.");
  }
}

export async function fetchCustomerIntakeRows(currentPage: number) {
  const offset = (currentPage - 1) * CUSTOMER_INTAKE_ROWS_PER_PAGE;
  try {
    const rows = await sql<CustomerIntake[]>`
      SELECT *
      FROM customer_intake
      ORDER BY submission_timestamp DESC
      LIMIT ${CUSTOMER_INTAKE_ROWS_PER_PAGE} OFFSET ${offset}
    `;
    return rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch customer intake rows.");
  }
}

export async function fetchCustomerIntakePages() {
  try {
    const data = await sql`SELECT COUNT(*) FROM customer_intake`;
    const totalPages = Math.ceil(
      Number(data[0].count) / CUSTOMER_INTAKE_ROWS_PER_PAGE,
    );
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of customer intake rows.");
  }
}

const CALLER_ID_ROWS_PER_PAGE = 10;
export async function fetchFilteredCallerIdLogs(query: string, currentPage: number) {
  const offset = (currentPage - 1) * CALLER_ID_ROWS_PER_PAGE;
  try {
    const logs = await sql<CallerIdLog[]>`
      SELECT t.id, t.call_sid, t.from_number, t.to_number, t.direction, t.call_status, t.caller_country,
        t.caller_city, t.caller_state, t.caller_zip,
        CONCAT_WS(' ', c.first_name, c.last_name) AS name,
        t.timestamp, t.raw_data
      FROM twilio_logs_a t
      LEFT JOIN customer_intake c ON c.phone = t.from_number
      WHERE
        t.from_number ILIKE ${`%${query}%`} OR
        t.to_number ILIKE ${`%${query}%`} OR
        t.call_sid ILIKE ${`%${query}%`} OR
        t.direction ILIKE ${`%${query}%`} OR
        t.call_status ILIKE ${`%${query}%`} OR
        t.caller_country ILIKE ${`%${query}%`} OR
        t.caller_city ILIKE ${`%${query}%`} OR
        t.caller_state ILIKE ${`%${query}%`} OR
        t.caller_zip ILIKE ${`%${query}%`}
      ORDER BY t.timestamp DESC
      LIMIT ${CALLER_ID_ROWS_PER_PAGE} OFFSET ${offset}
    `;
    const formattedLogs = logs.map((log) => ({
      ...log,
      timestamp:
        log.timestamp instanceof Date
          ? log.timestamp.toISOString()
          : String(log.timestamp),
    }));
    return formattedLogs;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch caller id logs.');
  }
}

export async function fetchCallerIdPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*) FROM twilio_logs_a WHERE
      from_number ILIKE ${`%${query}%`} OR
      to_number ILIKE ${`%${query}%`} OR
      call_sid ILIKE ${`%${query}%`} OR
      direction ILIKE ${`%${query}%`} OR
      call_status ILIKE ${`%${query}%`} OR
      caller_country ILIKE ${`%${query}%`} OR
      caller_city ILIKE ${`%${query}%`} OR
      caller_state ILIKE ${`%${query}%`} OR
      caller_zip ILIKE ${`%${query}%`}
    `;
    const totalPages = Math.ceil(Number(data[0].count) / CALLER_ID_ROWS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of caller id logs.');
  }
}

export async function fetchCustomerNotes(customerId: string) {
  try {
    const notes = await sql<CustomerNote[]>`
      SELECT id, customer_id, note, created_at
      FROM customer_notes
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
    `;
    return notes;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer notes.');
  }
}

export async function createCustomerNote(customerId: string, note: string) {
  try {
    const [created] = await sql<CustomerNote[]>`
      INSERT INTO customer_notes (customer_id, note)
      VALUES (${customerId}, ${note})
      RETURNING id, customer_id, note, created_at
    `;
    return created;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create customer note.');
  }
}
