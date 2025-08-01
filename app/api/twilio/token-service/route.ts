import { NextRequest, NextResponse } from 'next/server';
import { jwt } from 'twilio';

const { AccessToken } = jwt;

const VALID_USERS = {
  joe: process.env.JOE_USER_PASSWORD,
  aqua: process.env.AQUA_USER_PASSWORD,
} as const;

type ValidUser = keyof typeof VALID_USERS;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Shared logic
function validateUser(identity: string, password: string) {
  const isValidUser = (identity: string): identity is ValidUser =>
    identity in VALID_USERS;

  if (!isValidUser(identity)) return { ok: false };

  const expectedPassword = VALID_USERS[identity];
  if (!expectedPassword || password !== expectedPassword) return { ok: false };

  return { ok: true };
}

function createToken(identity: string) {
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_API_KEY_SID!,
    process.env.TWILIO_API_KEY_SECRET!,
    { identity, ttl: 3600 }
  );
  // Add PushGrant with push credential SID
  const pushGrant = {
    pushCredentialSid: process.env.PUSH_CREDENTIAL_SID!,
    toPayload: () => ({
      push_credential_sid: process.env.PUSH_CREDENTIAL_SID!,
    }),
    key: 'push',
  };

  // @ts-ignore because TypeScript doesn't know this grant
  token.addGrant(pushGrant);

  return token.toJwt();
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const identity = searchParams.get('identity') || '';
  const password = searchParams.get('password') || '';

  if (!identity || !password) {
    return new Response('Missing credentials', {
      status: 401,
      headers: corsHeaders,
    });
  }

  const result = validateUser(identity, password);
  if (!result.ok) {
    return new Response('Invalid credentials', {
      status: 401,
      headers: corsHeaders,
    });
  }

  const token = createToken(identity);
  return new Response(token, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/plain',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identity = String(body.identity);
    const password = String(body.password);

    const result = validateUser(identity, password);
    if (!result.ok) {
      return new Response('Invalid credentials', {
        status: 401,
        headers: corsHeaders,
      });
    }

    const token = createToken(identity);
    return new Response(token, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
      },
    });
  } catch (err) {
    console.error('POST error:', err);
    return new Response('Server error', {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
