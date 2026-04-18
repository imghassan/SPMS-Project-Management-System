import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AlertsCard = ({ alerts }) => {
    return (
        <div className="bg-[#0f1117] p-6 rounded-2xl border border-white/5 shadow-xl h-full">
            <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="text-orange-500" size={20} />
                <h3 className="font-bold text-white uppercase tracking-wider text-[12px]">Over-allocated Alerts</h3>
            </div>
            
            <div className="space-y-4">
                {alerts.length > 0 ? alerts.map((alert, i) => (
                    <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <img 
                                src={alert.avatar || '/default-avatar.png'} 
                                alt={alert.name} 
                                className="w-8 h-8 rounded-full border border-white/10"
                            />
                            <span className="text-[13px] font-semibold text-white/90 group-hover:text-white transition-colors">{alert.name}</span>
                        </div>
                        <span className="text-[12px] font-bold text-[#ef4444]">+{alert.overHours} hrs/week</span>
                    </div>
                )) : (
                    <div className="text-muted text-sm py-4">No over-allocated members found.</div>
                )}
            </div>
        </div>
    );
};

export default AlertsCard;
