export const getImageUrl = (imagePath) => {
  if (!imagePath) return '🍽️';
  
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
  
  const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = rawApiUrl.replace(/\/api$/, '').replace(/\/api\/$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  
  return `${baseUrl}${cleanPath}`;
};
