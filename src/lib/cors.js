export const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://boostraagency.org',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

export const withCors = (response) => {
  Object.entries(getCorsHeaders()).forEach(([name, value]) => {
    response.headers.set(name, value);
  });
  return response;
};