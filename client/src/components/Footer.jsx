import React from 'react';
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import {Link} from 'react-router-dom';
export const Footer = () => {
  return (
    <footer className="bg-bg-main border-t border-border pt-16 pb-8 px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center mb-16">
        <div className="max-w-md">
          <div className="flex items-center justify-center mb-4">
            <span className="font-bold text-xl tracking-tight uppercase text-primary">SPMS</span>
          </div>
          <p className="text-text-muted mb-6">
            The precision-engineered project management platform for modern, high-performance teams.
          </p>
          <div className="flex justify-center gap-4">
            {/* Social Icons */}
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary cursor-pointer transition-colors text-text-muted">
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <Facebook size={18} />
              </Link>
            </div>
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary cursor-pointer transition-colors text-text-muted">
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter size={18} />
              </Link>
            </div>
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary cursor-pointer transition-colors text-text-muted">
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Linkedin size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:row justify-between items-center gap-4 text-sm text-text-muted">
        <p>© 2026 Smart Project Management System (SPMS) Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};
