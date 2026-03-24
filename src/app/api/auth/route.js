import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// In-memory user store (production would use a database)
const users = new Map();

// Seed a demo user with hashed password
const DEMO_HASH = bcrypt.hashSync('demo123', 10);
users.set('demo@gigzora.com', {
  id: '1',
  name: 'Alex Johnson',
  email: 'demo@gigzora.com',
  password: DEMO_HASH,
  skills: ['React', 'Next.js', 'JavaScript', 'Node.js', 'CSS', 'Tailwind CSS'],
  experience: 4,
  location: 'San Francisco, CA',
  locationPreference: 'international',
  bio: 'Full-stack developer passionate about building great user experiences.',
  createdAt: new Date().toISOString(),
});

// ─── POST: Login / Signup ────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'signup') return handleSignup(body);
    if (action === 'login') return handleLogin(body);

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[API /auth] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ─── GET: Verify session ─────────────────────────────────────────────────────

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('gigzora-token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Return user data from token payload
    return NextResponse.json({
      user: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        skills: payload.skills || [],
        experience: payload.experience || 0,
        location: payload.location || '',
        locationPreference: payload.locationPreference || 'any',
      },
    });
  } catch (error) {
    console.error('[API /auth GET] Error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

// ─── Signup Handler ──────────────────────────────────────────────────────────

async function handleSignup({ name, email, password, skills, experience, location, locationPreference }) {
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  if (users.has(email.toLowerCase())) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    skills: skills || [],
    experience: experience || 0,
    location: location || '',
    locationPreference: locationPreference || 'any',
    bio: '',
    createdAt: new Date().toISOString(),
  };

  users.set(email.toLowerCase(), user);

  // Create safe user (no password)
  const { password: _, ...safeUser } = user;

  // Sign JWT
  const token = await signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    skills: user.skills,
    experience: user.experience,
    location: user.location,
    locationPreference: user.locationPreference,
  });

  // Set httpOnly cookie
  const response = NextResponse.json({ user: safeUser, message: 'Account created successfully' }, { status: 201 });
  response.cookies.set('gigzora-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}

// ─── Login Handler ───────────────────────────────────────────────────────────

async function handleLogin({ email, password }) {
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = users.get(email.toLowerCase());
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Compare hashed password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const { password: _, ...safeUser } = user;

  // Sign JWT
  const token = await signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    skills: user.skills,
    experience: user.experience,
    location: user.location,
    locationPreference: user.locationPreference,
  });

  // Set httpOnly cookie
  const response = NextResponse.json({ user: safeUser, message: 'Login successful' });
  response.cookies.set('gigzora-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return response;
}
