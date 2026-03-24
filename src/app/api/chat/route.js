import { NextResponse } from 'next/server';
import chatData from '@/data/chatResponses.json';

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = generateResponse(message.toLowerCase().trim());

    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

function generateResponse(message) {
  const keywordMap = {
    legal: ['legal', 'contract', 'law', 'agreement', 'intellectual property', 'ip', 'nda', 'tax', 'invoice'],
    pricing: ['price', 'pricing', 'rate', 'charge', 'cost', 'hourly', 'salary', 'money', 'earning', 'income', 'revenue', 'billing'],
    startup: ['startup', 'start up', 'business', 'launch', 'mvp', 'funding', 'investor', 'venture', 'bootstrap', 'company'],
    career: ['career', 'portfolio', 'resume', 'job', 'hire', 'skill', 'learn', 'grow', 'network', 'experience', 'interview'],
  };

  for (const [category, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => message.includes(kw))) {
      const responses = chatData.categories[category];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Greeting check
  const greetings = ['hello', 'hi', 'hey', 'greetings', 'sup', 'hola', 'good morning', 'good evening'];
  if (greetings.some(g => message.includes(g))) {
    return chatData.greetings[Math.floor(Math.random() * chatData.greetings.length)];
  }

  // Default response
  return chatData.categories.general[Math.floor(Math.random() * chatData.categories.general.length)];
}
