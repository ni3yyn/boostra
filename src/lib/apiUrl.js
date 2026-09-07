export const apiUrl = (path) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
    || (process.env.NODE_ENV === 'production' ? 'https://api.boostraagency.org' : '');
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};