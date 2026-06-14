import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioData } from '@/lib/dataManager';

// Helpers to call LLMs via raw fetch
async function callGemini(apiKey: string, systemInstruction: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemInstruction}\n\nUser Question: ${prompt}` }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.3,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Invalid response structure from Gemini API');
  return text;
}

async function callAnthropic(apiKey: string, systemInstruction: string, prompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.3,
      system: systemInstruction,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API returned status ${response.status}`);
  }

  const json = await response.json();
  const text = json?.content?.[0]?.text;
  if (!text) throw new Error('Invalid response structure from Anthropic API');
  return text;
}

async function callOpenAI(apiKey: string, systemInstruction: string, prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API returned status ${response.status}`);
  }

  const json = await response.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Invalid response structure from OpenAI API');
  return text;
}

// Local Keyword-based Fallback matching
function getLocalFallbackResponse(query: string, data: any): string {
  const q = query.toLowerCase();
  const firstName = data.firstName || 'the developer';
  const fullName = data.fullName || 'the developer';
  const title = data.title || 'Full Stack Engineer';
  const statsText = data.stats && data.stats.length > 0
    ? data.stats.map((s: any) => `${s.target}${s.suffix} ${s.label}`).join(', ')
    : '5+ Years of Experience';

  // stack / tech / skills
  if (q.includes('stack') || q.includes('tech') || q.includes('language') || q.includes('tool') || q.includes('skill')) {
    const tags = data.heroStackTags && data.heroStackTags.length > 0
      ? data.heroStackTags.join(', ')
      : 'Next.js, React, Django, Go, PostgreSQL, AWS';
    let skillsList = '';
    if (data.skills && data.skills.length > 0) {
      skillsList = `\n\n**All Skills:**\n` + data.skills.map((s: any) => `- **${s.name}** (${s.category})`).join('\n');
    }
    return `${firstName}'s primary technical stack includes: **${tags}**.\n\nThey are also experienced with backend system architectures, databases (PostgreSQL, Redis), containers (Docker), CI/CD pipelines, and cloud deployments (AWS).${skillsList}`;
  }

  // projects
  if (q.includes('project') || q.includes('work') || q.includes('build') || q.includes('showcase')) {
    if (data.projects && data.projects.length > 0) {
      const topProjects = data.projects.map((p: any) => `- **${p.name}** (${p.category}) [${p.year}]: ${p.tagline}${p.link ? ` ([Link](${p.link}))` : ''}`).join('\n');
      return `Here are some of ${firstName}'s projects:\n\n${topProjects}\n\nYou can view more details in the **Projects** section of the website!`;
    }
    return `${firstName} has shipped dozens of production-grade systems, including B2B/B2C marketplaces, SaaS applications, automation hubs, and enterprise platforms.`;
  }

  // certifications / credentials
  if (q.includes('cert') || q.includes('credential') || q.includes('license')) {
    if (data.certifications && data.certifications.length > 0) {
      const certs = data.certifications.map((c: any) => `- **${c.title}** by _${c.issuer}_ (${c.year})`).join('\n');
      return `Here are the certifications and credentials earned by ${firstName}:\n\n${certs}`;
    }
  }

  // services
  if (q.includes('service') || q.includes('offer') || q.includes('hire') || q.includes('consult')) {
    if (data.services && data.services.length > 0) {
      const svcs = data.services.map((s: any) => `- **${s.title}**: ${s.short}`).join('\n');
      return `Here are the professional services ${firstName} offers:\n\n${svcs}\n\nFeel free to reach out via the **Contact Form** if you have a project in mind!`;
    }
  }

  // experience / education
  if (q.includes('experience') || q.includes('education') || q.includes('history') || q.includes('college') || q.includes('university') || q.includes('degree')) {
    if (data.education && data.education.length > 0) {
      const edu = data.education.map((e: any) => `- **${e.role}** at _${e.company}_ (${e.year})${e.bullets && e.bullets.length > 0 ? `\n  - ${e.bullets.join('\n  - ')}` : ''}`).join('\n');
      return `Here is a summary of ${firstName}'s professional experience and education:\n\n${edu}\n\nOverall, they have **${statsText}**.`;
    }
    return `${firstName} is currently pursuing an Integrated Master of Technology in Software Engineering. They have years of hands-on remote engineering experience for global clients.`;
  }

  // contact
  if (q.includes('contact') || q.includes('email') || q.includes('social') || q.includes('github') || q.includes('linkedin') || q.includes('twitter') || q.includes('x.com')) {
    const contactEmail = data.email || 'satwiksai36@gmail.com';
    const githubLink = data.socials?.github;
    const linkedinLink = data.socials?.linkedin;
    const xLink = data.socials?.x;

    let socialLines = '';
    if (githubLink) {
      const display = githubLink.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
      socialLines += `\n- **GitHub**: [github.com/${display}](${githubLink})`;
    }
    if (linkedinLink) {
      const display = linkedinLink.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '');
      socialLines += `\n- **LinkedIn**: [linkedin.com/in/${display}](${linkedinLink})`;
    }
    if (xLink) {
      const display = xLink.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, '');
      socialLines += `\n- **X (Twitter)**: [x.com/${display}](${xLink})`;
    }

    return `You can get in touch with ${firstName} directly by emailing them at **${contactEmail}** or submitting a message via the **Contact Form** at the bottom of the page.${socialLines}`;
  }

  // resume
  if (q.includes('resume') || q.includes('cv') || q.includes('pdf')) {
    const resume = data.resumeUrl || '#';
    return `You can download ${firstName}'s resume directly [here](${resume})!`;
  }

  const matchesName = (data.firstName && q.includes(data.firstName.toLowerCase())) ||
    (data.lastName && q.includes(data.lastName.toLowerCase()));

  if (q.includes('who') || q.includes('about') || q.includes('bio') || matchesName) {
    return `**${fullName}** is a **${title}** with **${statsText}**. ${data.shortBio || ''}\n\n${data.subBio || ''}`;
  }

  return `Hi! I'm ${firstName}'s AI Assistant. Ask me anything about their technical skills, past projects, work history, services, certifications, or how to contact them. 

Examples:
- "What is your tech stack?"
- "Tell me about your projects"
- "Do you have any certifications?"
- "What services do you offer?"
- "How can I contact you?"`;
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const data = await getPortfolioData();

    // Environment Keys
    const geminiKey = process.env.GEMINI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    const statsText = data.stats && data.stats.length > 0
      ? data.stats.map((s: any) => `${s.target}${s.suffix} ${s.label}`).join(', ')
      : '5+ Years of Experience';

    // Strict Persona instructions with portfolio context
    const systemPrompt = `You are a helpful, professional, and friendly AI Assistant representing the portfolio of ${data.fullName || 'the developer'} (${data.brandName || 'Portfolio'}). 
Your purpose is to answer visitor questions about ${data.firstName || 'the developer'}'s professional background, skills, projects, certifications, and contact info.

Here is the verified portfolio data:
- Name: ${data.fullName}
- Title: ${data.title}
- Experience/Stats: ${statsText}
- Email: ${data.email}
- Location: ${data.location}
- Bio: ${data.shortBio} ${data.subBio}
- Stack: ${data.heroStackTags ? data.heroStackTags.join(', ') : ''}
- Skills Details: ${JSON.stringify(data.skills || [])}
- Services Details: ${JSON.stringify(data.services || [])}
- Projects: ${JSON.stringify(data.projects || [])}
- Education: ${JSON.stringify(data.education || [])}
- Certifications: ${JSON.stringify(data.certifications || [])}
- Socials: ${JSON.stringify(data.socials || {})}

Rules:
1. Answer ONLY based on the facts provided above. Do not invent or assume information.
2. Keep answers concise, clear, and direct. Use markdown for neatness (e.g. bolding, bullet points).
3. If the user asks about something completely unrelated to ${data.firstName || 'the developer'}'s portfolio, biography, or skills, politely decline and steer the conversation back: "I can only answer questions about ${data.firstName || 'the developer'}'s skills, projects, work experience, certifications, or contact details."
4. Be warm and encouraging.
`;

    let reply = '';
    let providerUsed = 'fallback';

    try {
      if (geminiKey) {
        reply = await callGemini(geminiKey, systemPrompt, message);
        providerUsed = 'gemini';
      } else if (anthropicKey) {
        reply = await callAnthropic(anthropicKey, systemPrompt, message);
        providerUsed = 'anthropic';
      } else if (openaiKey) {
        reply = await callOpenAI(openaiKey, systemPrompt, message);
        providerUsed = 'openai';
      } else {
        reply = getLocalFallbackResponse(message, data);
        providerUsed = 'fallback';
      }
    } catch (apiError) {
      console.error(`Error calling ${providerUsed} API, resorting to fallback:`, apiError);
      reply = getLocalFallbackResponse(message, data);
      providerUsed = 'fallback (resorted)';
    }

    return NextResponse.json({ reply, provider: providerUsed });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
