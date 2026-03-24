import { NextResponse } from 'next/server';
import { getChatResponse, detectIntent } from '@/lib/chatbot';

const SYSTEM_PROMPT = `You are GigZora AI Assistant — a knowledgeable, helpful assistant built into the GigZora freelance marketplace platform.

You can answer ANY question the user asks — whether it's about freelancing, technology, learning new skills, personal development, business, coding, design, marketing, or general knowledge.

When the topic is related to freelancing, you should provide expert-level advice on:
- Pricing strategies & rate setting
- Legal protections, contracts, NDAs
- Invoicing & getting paid
- Finding clients & cold outreach
- Writing winning proposals
- Tax advice for freelancers
- Personal branding & marketing
- Starting and scaling a freelance business
- Learning new skills (video editing, web development, design, etc.)

Guidelines:
- Always answer the user's actual question directly and helpfully.
- Be concise but thorough. Use bullet points and bold text for readability.
- Use relevant emojis sparingly for visual appeal.
- Provide actionable, specific advice — not generic platitudes.
- When relevant, mention tools, platforms, courses, or resources the user can use.
- Format responses with markdown (bold, bullet lists, numbered lists) for readability.
- If asked how to learn something, give a clear roadmap with steps and resources.`;

export async function POST(request) {
  try {
    const { message, history } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('your-')) {
      // No API key configured — use local chatbot
      return NextResponse.json({
        response: getChatResponse(message),
        intent: detectIntent(message),
      });
    }

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history (last 10 messages)
    if (history && Array.isArray(history)) {
      const recent = history.slice(-10);
      for (const msg of recent) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    }

    // Add the current message
    messages.push({ role: 'user', content: message });

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://gigzora.com',
        'X-Title': 'GigZora AI Assistant',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('[OpenRouter] API error:', res.status, errorData);
      
      const errorMessage = errorData?.error?.message || `OpenRouter API Error: ${res.status}`;
      return NextResponse.json({
        response: `⚠️ **AI API Error:** ${errorMessage}\n\nPlease check your OpenRouter API key or credits.`,
        intent: 'error',
      });
    }

    const data = await res.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('[OpenRouter] Empty response:', data);
      return NextResponse.json({
        response: getChatResponse(message),
        intent: detectIntent(message),
        fallback: true,
      });
    }

    return NextResponse.json({
      response: aiResponse,
      intent: 'ai',
      model: data.model || 'deepseek',
    });

  } catch (error) {
    console.error('[API /chat] Error:', error);
    // Fallback to local chatbot on any error
    return NextResponse.json({
      response: getChatResponse(error?.message ? 'error' : ''),
      intent: 'error',
      fallback: true,
    });
  }
}
