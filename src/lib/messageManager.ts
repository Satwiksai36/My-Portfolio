import fs from 'fs';
import path from 'path';

const MESSAGES_FILE = path.join(process.cwd(), 'src/lib/messages.json');

export interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  timestamp: string;
}

export async function getMessages(): Promise<Message[]> {
  const isNetlify = typeof process.env.SITE_ID !== 'undefined' || 
                    typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined' ||
                    typeof process.env.NETLIFY_IMAGES_CDN_DOMAIN !== 'undefined';
  if (isNetlify) {
    try {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore('portfolio-data');
      const data = await store.get('messages', { type: 'json' });
      if (data) {
        return data as Message[];
      }
    } catch (blobError) {
      console.error('Error reading messages from Netlify Blobs:', blobError);
    }
  }

  // Fallback to local file read
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const content = await fs.promises.readFile(MESSAGES_FILE, 'utf8');
      return JSON.parse(content) as Message[];
    }
  } catch (fileError) {
    console.error('Error reading local messages file:', fileError);
  }

  return [];
}

export async function saveMessage(msg: Omit<Message, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<Message> {
  const messages = await getMessages();
  const newMessage: Message = {
    id: msg.id || Math.random().toString(36).substring(2, 9),
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    timestamp: msg.timestamp || new Date().toISOString()
  };
  messages.unshift(newMessage);

  const isNetlify = typeof process.env.SITE_ID !== 'undefined' || 
                    typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined' ||
                    typeof process.env.NETLIFY_IMAGES_CDN_DOMAIN !== 'undefined';
  if (isNetlify) {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('portfolio-data');
    await store.setJSON('messages', messages);
  } else {
    const dir = path.dirname(MESSAGES_FILE);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(
      MESSAGES_FILE,
      JSON.stringify(messages, null, 2),
      'utf8'
    );
  }
  return newMessage;
}

export async function deleteMessage(id: string): Promise<void> {
  let messages = await getMessages();
  messages = messages.filter(m => m.id !== id);

  const isNetlify = typeof process.env.SITE_ID !== 'undefined' || 
                    typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined' ||
                    typeof process.env.NETLIFY_IMAGES_CDN_DOMAIN !== 'undefined';
  if (isNetlify) {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('portfolio-data');
    await store.setJSON('messages', messages);
  } else {
    await fs.promises.writeFile(
      MESSAGES_FILE,
      JSON.stringify(messages, null, 2),
      'utf8'
    );
  }
}
