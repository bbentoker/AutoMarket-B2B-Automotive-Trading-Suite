export const getApiBaseUrl = () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  return apiBaseUrl;
}; 