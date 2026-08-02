import { getAllRecords, getRecord, putRecord } from '../storage/db';

export type ConversationRole = 'user' | 'assistant';

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function createConversation(title = 'New conversation'): Promise<Conversation> {
  const conversation: Conversation = {
    id: newId(),
    title,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    messages: [],
  };
  await putRecord('conversations', conversation as unknown as Record<string, unknown>);
  return conversation;
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  return getRecord<Conversation>('conversations', id);
}

export async function listConversations(limit = 20): Promise<Conversation[]> {
  const all = await getAllRecords<Conversation>('conversations');
  return all
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export async function appendMessage(
  conversationId: string,
  role: ConversationRole,
  content: string,
): Promise<ConversationMessage> {
  const existing = await getConversation(conversationId);
  if (!existing) {
    throw new Error(`Conversation not found: ${conversationId}`);
  }
  const message: ConversationMessage = {
    id: newId(),
    role,
    content,
    createdAt: nowIso(),
  };
  const updated: Conversation = {
    ...existing,
    title:
      existing.messages.length === 0 && role === 'user'
        ? content.slice(0, 40)
        : existing.title,
    updatedAt: nowIso(),
    messages: [...existing.messages, message],
  };
  await putRecord('conversations', updated as unknown as Record<string, unknown>);
  return message;
}
