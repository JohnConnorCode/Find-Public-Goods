import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 py-4 mt-8">
      <div className="text-center text-gray-600">
        <a href="/about" className="mx-2 hover:underline">About</a>
        <a href="/contact" className="mx-2 hover:underline">Contact</a>
        <a href="/privacy" className="mx-2 hover:underline">Privacy Policy</a>
        <a href="/terms" className="mx-2 hover:underline">Terms of Service</a>
      </div>
      <div className="mt-2 text-center text-gray-500">
        &copy; {new Date().getFullYear()} Find Public Goods
      </div>
    </footer>
  );
};

export default Footer;
