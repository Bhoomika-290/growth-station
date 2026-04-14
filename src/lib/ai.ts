import { getToken } from './auth';

export type Msg = { role: 'user' | 'assistant'; content: string };

interface StreamOptions {
  messages: Msg[];
  mode?: string;
  context?: Record<string, string>;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}

export async function streamChat({ messages, mode, context, onDelta, onDone, onError }: StreamOptions) {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages, mode, context }),
  });

  if (resp.status === 429 || resp.status === 402) {
    const data = await resp.json();
    onError?.(data.error || 'Rate limited. Try again later.');
    return;
  }

  if (!resp.ok || !resp.body) {
    onError?.('Failed to connect to AI. Please try again.');
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = '';
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') { streamDone = true; break; }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + '\n' + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split('\n')) {
      if (!raw) continue;
      if (raw.endsWith('\r')) raw = raw.slice(0, -1);
      if (raw.startsWith(':') || raw.trim() === '') continue;
      if (!raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { }
    }
  }

  onDone();
}
