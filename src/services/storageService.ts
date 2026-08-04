import { supabase, isSupabaseConfigured } from './supabase';
import type { Attachment } from '../types/Aether';

const BUCKET_NAME = 'issue-attachments';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
}

export async function uploadIssueAttachment(
  issueId: string,
  file: File,
  uploaderId: string
): Promise<Attachment | null> {
  const attachmentId = generateId();
  
  if (isSupabaseConfigured) {
    try {
      const ext = file.name.split('.').pop() || '';
      const storagePath = `${issueId}/${attachmentId}.${ext}`;
      
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw error; // Let it fallback to base64
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      return {
        id: attachmentId,
        name: file.name,
        url: publicUrlData.publicUrl,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        uploaderId
      };
    } catch (e) {
      console.warn('Falling back to local base64 due to upload error', e);
    }
  }

  // Fallback to local DataURL (base64)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        id: attachmentId,
        name: file.name,
        url: e.target?.result as string,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        uploaderId
      });
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export async function deleteIssueAttachment(
  url: string
): Promise<boolean> {
  if (url.startsWith('data:')) {
    return true; // No remote file to delete
  }
  
  if (isSupabaseConfigured) {
    try {
      const bucketUrlPath = `/object/public/${BUCKET_NAME}/`;
      const idx = url.indexOf(bucketUrlPath);
      
      if (idx !== -1) {
        const path = url.substring(idx + bucketUrlPath.length);
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([decodeURIComponent(path)]);
          
        if (error) {
          console.error('Supabase delete error:', error);
          return false;
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to delete from Supabase:', e);
      return false;
    }
  }
  
  return true;
}
