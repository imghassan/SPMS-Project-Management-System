import React from 'react';
import { PieChart } from 'lucide-react';

const CapacityCard = ({ capacity }) => {
    return (
        <div className="bg-[#0f1117] p-6 rounded-2xl border border-white/5 shadow-xl h-full">
            <div className="flex items-center gap-3 mb-6">
                <PieChart className="text-[#00D1FF]" size={20} />
                <h3 className="font-bold text-white uppercase tracking-wider text-[12px]">Department Capacity</h3>
            </div>
            
            <div className="space-y-6">
                {capacity.map((dept, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[13px] font-semibold">
                            <span className="text-white/80">{dept.department}</span>
                            <span className={dept.isWarning ? 'text-[#f97316]' : 'text-[#00D1FF]'}>{dept.percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ease-out ${dept.isWarning ? 'bg-[#f97316]' : 'bg-[#00D1FF]'}`}
                                style={{ width: `${dept.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CapacityCard;
