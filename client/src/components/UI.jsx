import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`btn ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Input = ({ className = '', ...props }) => (
  <input
    className={`custom-input ${className}`}
    {...props}
  />
);

export const Badge = ({ children, variant = 'info', className = '' }) => (
  <span className={`insight-badge ${variant} ${className}`}>
    {children}
  </span>
);

export const Card = ({ children, className = '', ...props }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`card ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);
