export const getImageUrl = (imagePath) => {
  if (!imagePath) return '🍽️';
  
  // If it's an emoji (length <= 2)
  if (imagePath.length <= 2) return imagePath;
  
  // If it's a base64 string
  if (imagePath.trim().startsWith('data:')) {
    // Sanitize: remove any spaces or newlines that might break the URL
    return imagePath.trim().replace(/\s/g, '');
  }
  
  // If it's already a full URL
  if (imagePath.startsWith('http')) return imagePath;
  
  // Otherwise, assume it's a relative path from the backend
  const baseUrl = 'https://gila-house-backend-production.up.railway.app'; 

  // const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  // Ensure we don't have double slashes
  const cleanPath = imagePath.trim().startsWith('/') ? imagePath.trim() : `/${imagePath.trim()}`;
  
  return `${baseUrl}${cleanPath}`;
};
