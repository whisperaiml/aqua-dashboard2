import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { validateRequest } from 'twilio';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL!;

// Helper: Parse Twilio key=value\n payload into object
function parseTwilioBody(bodyStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of bodyStr.split('\n')) {
    const i = line.indexOf('=');
    if (i === -1) continue;
    const key = line.slice(0, i);
    const value = line.slice(i + 1);
    result[key] = value;
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text(); // Raw body string (form-encoded)
    const urlParams = new URLSearchParams(rawText); // Original parameters
    const paramObj = Object.fromEntries(urlParams); // For signature and later parsing

    const signature = req.headers.get('x-twilio-signature') || '';
    const isVerified = validateRequest(
      TWILIO_AUTH_TOKEN,
      signature,
      WEBHOOK_URL,
      paramObj
    );

    if (!isVerified) {
      console.warn('❌ Invalid Twilio Signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Parse the embedded key=value payload
    const parsed = parseTwilioBody(paramObj.body || '');

    console.log('📥 Final parsed Twilio body:', parsed);

    // Insert into DB
    await sql`
      INSERT INTO twilio_aqua_incoming (
        call_sid, from_number, to_number, direction,
        call_status, caller_country, caller_city, caller_state, caller_zip,
        raw_data
      ) VALUES (
        ${parsed.CallSid ?? null},
        ${parsed.From ?? null},
        ${parsed.To ?? null},
        ${parsed.Direction ?? null},
        ${parsed.CallStatus ?? null},
        ${parsed.CallerCountry ?? null},
        ${parsed.CallerCity ?? null},
        ${parsed.CallerState ?? null},
        ${parsed.CallerZip ?? null},
        ${sql.json(parsed)}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('🔥 Webhook error:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
