import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './UI';
import { Layout, MessageSquare, BarChart3 } from 'lucide-react';
import TeamImage from '../public/Team.png';
import KanbanBoardImage from '../public/KanbanBoard.png';
import ReportsImage from '../public/Reports.png';
import '../styles/Components/Workflow.css';

const features = [
  {
    title: 'Visual Kanban Boards',
    description: 'Drag and drop tasks to stay organized and visualize your team\'s progress at a single glance with intuitive pipelines.',
    icon: Layout,
    image: KanbanBoardImage,
  },
  {
    title: 'Team Collaboration',
    description: 'Chat, share files, and mention teammates directly within tasks to keep everyone in sync without leaving the workspace.',
    icon: MessageSquare,
    image: TeamImage,
  },
  {
    title: 'Automated Reporting',
    description: 'Generate insightful reports and track KPIs automatically to make data-driven decisions and optimize resource allocation.',
    icon: BarChart3,
    image: ReportsImage,
  },
];

export const Workflow = () => {
  return (
    <section id="features" className="py-32 px-8 bg-bg-main relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 flex flex-col items-center">
          <div className="flex items-center gap-2 px-4 py-2 mb-8 max-w-fit">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse border border-white/10" />
            <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Built for Efficiency</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight max-w-4xl leading-[1.1]">
            Streamline Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D1FF] to-[rgba(0,209,255,0.5)]">Workflow</span>
          </h2>
          <p className="text-text-muted max-w-2xl text-lg md:text-xl leading-relaxed opacity-80">
            Powerful tools designed to help high-performance teams scale without the complexity of traditional management software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Card key={i} className="p-10 flex flex-col items-start gap-6 bg-bg-section/30 border-white/5 rounded-[32px] hover:bg-bg-section/50 transition-all group">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#1E293B]/50 text-primary border border-white/5"
              >
                <feature.icon size={20} />
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed text-sm md:text-base opacity-70">
                  {feature.description}
                </p>
              </div>

              <div className="workflow-image-wrapper">
                <img
                  src={feature.image}
                  alt={`${feature.title} screenshot`}
                  className="workflow-image h-full"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
