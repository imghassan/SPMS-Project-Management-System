import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from './UI';
import DashboardImage from '../public/Dashboard.png';

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 px-8 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary opacity-5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-7xl font-bold mb-8 tracking-tight max-w-4xl text-center"
        >
          Manage Projects with <span className="text-primary">Precision</span> and Speed
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-text-muted mb-12 max-w-2xl text-center mx-auto"
        >
          Smart Project Management System (SPMS) helps teams streamline workflows, hit deadlines, and scale faster with intuitive Kanban boards and real-time collaboration tools.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-8"
        >
          <Link to="/signup">
            <Button variant="primary" className="whitespace-nowrap px-8 py-4 text-lg hover:bg-[#00B4E6]">
              Get Started
            </Button>
          </Link>
        </motion.div>

        {/* Screenshots */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <img src={DashboardImage} alt="Dashboard screenshot" className="w-full h-auto rounded-2xl border border-white/10 shadow-xl" />
        </motion.div>
      </div>
    </section>
  );
};
