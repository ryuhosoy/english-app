import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log('=== TEST LOG API CALLED ===');
  console.log('Time:', new Date().toISOString());
  console.log('Request URL:', req.url);
  console.log('User Agent:', req.headers.get('user-agent'));
  
  return NextResponse.json({ 
    message: 'Test log successful',
    timestamp: new Date().toISOString(),
    serverTime: Date.now()
  });
}

export async function POST(req: NextRequest) {
  console.log('=== TEST LOG POST API CALLED ===');
  console.log('Time:', new Date().toISOString());
  
  const body = await req.json();
  console.log('Request body:', body);
  
  return NextResponse.json({ 
    message: 'POST test log successful',
    receivedData: body,
    timestamp: new Date().toISOString()
  });
} 