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
    uri: fileUri,
    name: fileName ?? `speech_${Date.now()}.m4a`,
    type: mimeType ?? 'audio/m4a',
  } as any);

  const { data } = await axiosPrivate.post('/conversation/submit-speech', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.data ?? data;
}

export interface ConversationRoom {
  id: string;
  conversationId: string;
  title?: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface GetConversationRoomsResponse {
  statusCode: number;
  data: {
    results: ConversationRoom[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
  };
  message?: string;
}

export async function getConversationRooms(params?: {
  currentPage?: number;
  pageSize?: number;
}): Promise<GetConversationRoomsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.currentPage) {
    queryParams.append('currentPage', params.currentPage.toString());
  }
  if (params?.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }
  const queryString = queryParams.toString();
  const { data } = await axiosPrivate.get(
    `/ai-conversation-room${queryString ? `?${queryString}` : ''}`
  );
  return data;
}

export async function deleteConversationRoom(id: string): Promise<void> {
  await axiosPrivate.delete(`/ai-conversation-room/${id}`);
}

export interface VoiceOption {
  name: string; // Voice name (e.g., "ja-JP-Wavenet-A")
  ssmlGender?: "MALE" | "FEMALE" | "NEUTRAL";
  languageCode?: string;
  // For display purposes
  description?: string;
  sampleAudioUrl?: string;
}

export interface GetVoicesResponse {
  statusCode: number;
  data: {
    voices: VoiceOption[];
  };
  message?: string;
}

export interface PreviewVoiceRequest {
  voiceName: string;
  sampleText: string;
}

export interface PreviewVoiceResponse {
  statusCode: number;
  data: {
    audio: string; // Base64 audio
    audioFormat?: string; // "ogg", "mp3", etc.
  };
  message?: string;
}

/**
 * Get available voices for Japanese language
 */
export async function getAvailableVoices(): Promise<GetVoicesResponse> {
  const { data } = await axiosPrivate.get("/speech/voices/ja-JP");
  return data;
}

/**
 * Preview voice with sample text
 */
export async function previewVoice(
  params: PreviewVoiceRequest
): Promise<PreviewVoiceResponse> {
  const { data } = await axiosPrivate.post("/speech/preview-voice", params);
  return data;
}

