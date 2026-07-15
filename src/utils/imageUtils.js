export const getImageUrl = (imagePath) => {
  if (!imagePath) return '🍽️';
  
<<<<<<< HEAD
  let trimmed = imagePath.trim();
  
  // Strip variation selectors (\uFE0F) to ensure standard emojis have a length <= 2
  trimmed = trimmed.replace(/\uFE0F/g, '');
  
  // If it's an emoji or short icon (length <= 2)
  if (trimmed.length <= 2) return trimmed;
  
  // If it's a base64 string
  if (trimmed.startsWith('data:')) {
    return trimmed.replace(/\s/g, '');
  }
  
  // If it's already a full URL
  if (trimmed.startsWith('http')) return trimmed;
  
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
=======
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
>>>>>>> 01688e58b9866ba1b34ee34e6ad8ff98ebce771e
  
  return `${baseUrl}${cleanPath}`;
};
