import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'station-dev-secret-change-in-prod';

app.use(cors());
app.use(express.json());

function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, domain } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ email, password: hashed, name, domain: domain || 'engineering' }).returning();
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: any, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/auth/profile', authMiddleware, async (req: any, res) => {
  try {
    const { name, city, domain, college, specialization, dreamCompany } = req.body;
    const [updated] = await db.update(users)
      .set({ name, city, domain, college, specialization, dreamCompany })
      .where(eq(users.id, req.user.id))
      .returning();
    const { password: _, ...safeUser } = updated;
    res.json(safeUser);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// AI chat route — server-side, key never exposed to browser
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, mode, context } = req.body;
    const AI_API_KEY = process.env.AI_API_KEY;
    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key is not configured. Please add AI_API_KEY to your environment secrets.' });
    }

    let systemPrompt = 'You are a helpful AI interview coach.';

    if (mode === 'mock-interview') {
      systemPrompt = `You are a professional interviewer conducting a realistic mock interview for ${context?.domain || 'engineering'} placements in India.
The student is ${context?.userName || 'a student'} preparing for ${context?.company || 'a top company'}.

Rules:
- Be professional and realistic like a real interviewer
- Mix HR and technical questions
- Ask one question at a time
- When asked to evaluate, provide CONFIDENCE and CLARITY scores and SUGGESTIONS
- Keep the interview flowing naturally
- Ask follow-up questions based on answers
- Be specific to Indian campus placement context`;
    } else if (mode === 'interview-prep') {
      systemPrompt = `You are an expert interview coach for ${context?.domain || 'engineering'} placements in India. 
The student's name is ${context?.userName || 'Student'}, preparing for ${context?.company || 'a company'} at ${context?.level || 'Foundation'} level.
Their specialization is ${context?.specialization || 'general'} from ${context?.college || 'their college'}.

Rules:
- Ask one interview question at a time
- After the student answers, give specific, actionable feedback (2-3 sentences max)
- Rate their answer out of 10
- Then ask the next question
- Tailor questions to the company and level
- Use examples relevant to Indian placements
- Be encouraging but honest`;
    } else if (mode === 'self-intro-feedback') {
      systemPrompt = `You are a speech coach. Analyze the student's self-introduction and provide:
1. Overall rating out of 10
2. What they did well (2 points)
3. What to improve (3 specific, actionable points)
4. A rewritten improved version of any weak lines
Be specific to their content, not generic.`;
    } else if (mode === 'self-intro-generate') {
      systemPrompt = `You are an expert interview coach. Generate a natural, confident self-introduction script for an Indian student. 
Return ONLY the script lines, one per line, no numbering. Make it 6-8 lines, each line should be 1-2 sentences.
Make it natural and conversational, not robotic. Include greeting, education, skills, motivation, and closing.
Tailor it specifically to the details provided.`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.REPLIT_DEV_DOMAIN || 'https://station.repl.co',
        'X-Title': 'Station Interview Prep',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return res.status(429).json({ error: 'Rate limited. Please try again in a moment.' });
      if (response.status === 402) return res.status(402).json({ error: 'AI credits exhausted.' });
      const text = await response.text();
      console.error('AI error:', response.status, text);
      return res.status(500).json({ error: 'AI service error' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (e) {
    console.error('Chat error:', e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

// Leaderboard route
app.get('/api/leaderboard', async (_req, res) => {
  try {
    const top = await db.select({
      name: users.name,
      score: users.score,
      city: users.city,
    }).from(users).orderBy(users.score).limit(10);
    res.json(top.reverse());
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve static frontend in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
