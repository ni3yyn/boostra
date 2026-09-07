/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 🔥 FORCING COMPATIBILITY
  transpilePackages: [
    'next', // Attempt to transpile Next.js client internals
    'framer-motion', 
    'lucide-react', 
    'tsparticles'
  ],
  reactCompiler: true,
  allowedDevOrigins: ['10.255.152.105', '192.168.1.11', 'localhost:3000', 'https://soheib.web.app/'],
  };
  
  module.exports = nextConfig;