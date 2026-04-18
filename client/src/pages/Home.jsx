import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
// import { Trust } from '../components/Trust';
import { Workflow } from '../components/Workflow';
// import { Pricing } from '../components/Pricing';
import { CTA } from '../components/CTA';
import { Footer } from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar />
      <main>
        <Hero />
        {/* <Trust /> */}
        <Workflow />
        {/* <Pricing /> */}
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
