import { mockDelay, apiClient, USE_MOCK } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

const MOCK_REPLY =
  "I'm running in demo mode right now (no backend connected), so I can't look up real events yet. " +
  'Switch VITE_USE_MOCK_DATA to false and point VITE_API_BASE_URL at the backend to try me for real.';

async function mockSendMessage() {
  await mockDelay(400);
  return ok({ reply: MOCK_REPLY, provider: 'mock' });
}

async function realSendMessage(message, context) {
  try {
    const res = await apiClient.post('/chatbot/message', { message, context });
    return ok(res.data);
  } catch (err) {
    return fail(err.message, err.code);
  }
}

export const sendChatMessage = USE_MOCK ? mockSendMessage : realSendMessage;
