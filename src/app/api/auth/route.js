import { NextResponse } from 'next/server';

// In-memory user store
const users = new Map();

// Seed a demo user
users.set('demo@gigzora.com', {
  id: '1',
  name: 'Alex Johnson',
  email: 'demo@gigzora.com',
  password: 'demo123',
  skills: ['React', 'Next.js', 'JavaScript', 'Node.js', 'CSS', 'Tailwind CSS'],
  experience: 4,
  location: 'San Francisco, CA',
  locationPreference: 'international',
  bio: 'Full-stack developer passionate about building great user experiences.',
  createdAt: new Date().toISOString(),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'signup') {
      return handleSignup(body);
    } else if (action === 'login') {
      return handleLogin(body);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function handleSignup({ name, email, password, skills, experience, location, locationPreference }) {
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  if (users.has(email.toLowerCase())) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const user = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    password,
    skills: skills || [],
    experience: experience || 0,
    location: location || '',
    locationPreference: locationPreference || 'any',
    bio: '',
    createdAt: new Date().toISOString(),
  };

  users.set(email.toLowerCase(), user);

  const { password: _, ...safeUser } = user;
  return NextResponse.json({ user: safeUser, message: 'Account created successfully' }, { status: 201 });
}

function handleLogin({ email, password }) {
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = users.get(email.toLowerCase());
  if (!user || user.password !== password) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const { password: _, ...safeUser } = user;
  return NextResponse.json({ user: safeUser, message: 'Login successful' });
}
