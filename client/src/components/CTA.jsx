import React from 'react';
import { Button } from './UI';
import { Link } from 'react-router-dom';

export const CTA = () => {
  return (
    <section className="py-32 px-8">
      <div className="max-w-5xl mx-auto rounded-[32px] bg-primary p-12 md:p-24 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-bg-main/20 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-bold text-bg-main mb-8 leading-tight">
            Ready to transform how your team works?
          </h2>
          <p className="text-bg-main/80 text-xl mb-12 max-w-2xl">
            Join thousands of teams who trust SPMS to deliver their projects on time, every time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/signup">
              <Button variant="secondary" className="bg-bg-main text-white border-none py-4 px-8 min-w-[200px]">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
