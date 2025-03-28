import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  const isValidCredentials = 
    email === 'rayo@ucr.ac.cr' && 
    password === 'AdminRiskManager123!';

  return NextResponse.json({ success: isValidCredentials });
}