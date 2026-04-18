/**
 * Construct a full URL for an avatar image.
 * Handles absolute URLs, relative paths from the backend, and default avatars.
 * 
 * @param {string} avatar - The avatar path or URL from the database
 * @returns {string|null} - The full URL or null if no avatar is set
 */
export const getAvatarUrl = (avatar) => {
  if (!avatar || avatar === 'default-avatar.png') {
    return null;
  }

  // If it's already a full URL (e.g., from a third-party provider or already processed)
  if (avatar.startsWith('http')) {
    return avatar;
  }

  // The backend currently serves uploads from /uploads
  const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  
  // Ensure the relative path starts with a slash
  const relativePath = avatar.startsWith('/') ? avatar : `/${avatar}`;
  
  return `${backendBaseUrl}${relativePath}`;
};
