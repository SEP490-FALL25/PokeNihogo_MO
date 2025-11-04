import * as FileSystem from 'expo-file-system';

import { axiosPrivate } from '@configs/axios';

// Basic shapes the BE is expected to return. Adjust to match BE when available.
export interface ConversationStartResponse {
  conversationId: string;
  turnId: string;
  aiMessage: {
    text: string;
    audioUrl?: string;
  };
  nextUserPrompt?: string; // expected line for the user
}

export interface SubmitSpeechResponse {
  conversationId: string;
  turnId: string; // new turn id for the next exchange
  recognizedText: string;
  words?: { word: string; correct: boolean; score?: number }[]; // pronunciation indicators
  aiMessage?: {
    text: string;
    audioUrl?: string;
  };
  nextUserPrompt?: string;
}

export async function startConversation(topicId: string): Promise<ConversationStartResponse> {
  const { data } = await axiosPrivate.get('/conversation/start', { params: { topicId } });
  // Expect { data: {...} }
  return data?.data ?? data;
}

export async function submitUserSpeech(
  params: {
    conversationId: string;
    turnId: string;
    topicId?: string;
    fileUri: string;
    fileName?: string;
    mimeType?: string; // default to audio/m4a
  }
): Promise<SubmitSpeechResponse> {
  const { conversationId, turnId, topicId, fileUri, fileName, mimeType } = params;

  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error('Audio file not found');
  }

  const form = new FormData();
  form.append('conversationId', conversationId);
  form.append('turnId', turnId);
  if (topicId) form.append('topicId', topicId);
  form.append('file', {
    // @ts-ignore FormData file for React Native
    uri: fileUri,
    name: fileName ?? `speech_${Date.now()}.m4a`,
    type: mimeType ?? 'audio/m4a',
  });

  const { data } = await axiosPrivate.post('/conversation/submit-speech', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.data ?? data;
}


