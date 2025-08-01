import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function listCustomerIntakeColumns() {
  const data = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customer_intake'
    ORDER BY ordinal_position;
  `;
  return data.map((row) => row.column_name);
}

export async function GET() {
  try {
    return Response.json(await listCustomerIntakeColumns());
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
