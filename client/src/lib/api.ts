import { apiRequest } from "./queryClient";
import { ApiKeys, Summary, UserContext, UserReflection } from "./types";

// API functions for Audio Weaver application

export async function uploadFiles(files: File[]): Promise<{ uploadIds: number[] }> {
  const formData = new FormData();
  
  // Use the field name "files" to match the server-side configuration
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

export async function processDocuments(
  uploadIds: number[],
  context?: UserContext
): Promise<{ processingId: number }> {
  const response = await apiRequest('POST', '/api/process', {
    uploadIds,
    context
  });
  
  return response.json();
}

export async function getProcessingStatus(
  processingId: number | string
): Promise<{
  status: string;
  progress: number;
  summary?: Summary;
  error?: string;
}> {
  const response = await fetch(`/api/process/${processingId}/status`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get processing status: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

export async function saveApiKeys(keys: ApiKeys): Promise<void> {
  await apiRequest('POST', '/api/settings/api-keys', keys);
}

export async function getApiKeys(): Promise<ApiKeys> {
  const response = await fetch('/api/settings/api-keys', {
    credentials: 'include'
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return { gemini: '', elevenlabs: '' };
    }
    const errorText = await response.text();
    throw new Error(`Failed to get API keys: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

export async function saveReflection(
  summaryId: string,
  reflection: UserReflection
): Promise<void> {
  await apiRequest('POST', `/api/summaries/${summaryId}/reflection`, reflection);
}

export async function downloadAudio(summaryId: string): Promise<Blob> {
  const response = await fetch(`/api/summaries/${summaryId}/audio/download`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to download audio: ${response.status} - ${errorText}`);
  }
  
  return response.blob();
}

export async function exportReflections(summaryId: string): Promise<void> {
  const response = await fetch(`/api/summaries/${summaryId}/reflections/export`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to export reflections: ${response.status} - ${errorText}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reflections-summary-${summaryId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
