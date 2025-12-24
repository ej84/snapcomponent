import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

// 반환 타입 정의
interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Upload an image to Firebase Storage
 * @param file - Image file to upload
 * @param userId - User ID for folder organization
 * @returns Download URL or error
 */
export async function uploadImage(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { error: 'Invalid file type. Only PNG, JPG, and WebP are allowed.' };
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'File too large. Maximum size is 5MB.' };
    }

    // Create storage reference
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `uploads/${userId}/${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return { url: downloadURL };
  } catch (error: any) {
    console.error('Storage upload error:', error);
    return { error: error.message || 'Failed to upload image' };
  }
}