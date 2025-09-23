
'use client';
import { ItineraryV2, ItineraryStep } from "@/lib/types";
import { Circle, PersonStanding, Bus } from "lucide-react";
import { getLineColor } from "@/lib/constants";

type ItineraryTimelineProps = {
    itinerary: ItineraryV2;
};

const TimelineIcon = ({ type, lineId }: { type: 'START' | 'END' | 'WALK' | 'TRANSIT', lineId?: number }) => {
    const iconWrapperClass = "absolute left-0 -translate-x-1/2 z-10 p-1 bg-background rounded-full";
    const color = type === 'TRANSIT' && lineId ? getLineColor(lineId) : 'hsl(var(--primary))';

    switch (type) {
        case 'START':
        case 'END':
            return (
                <div className={iconWrapperClass}>
                    <Circle className="h-3.5 w-3.5" fill="currentColor" strokeWidth={1} />
                </div>
            );
        case 'WALK':
            return (
                <div className={`${iconWrapperClass} bg-transparent`}>
                    <PersonStanding className="h-4 w-4 text-muted-foreground" />
                </div>
            );
        case 'TRANSIT':
            return (
                <div className={`${iconWrapperClass} bg-transparent`}>
                    <Bus className="h-5 w-5" style={{ color }} />
                </div>
            );
        default:
            return null;
    }
};

const TimelineItem = ({ step, isLast }: { step: ItineraryStep, isLast: boolean }) => {
    const color = step.line_id ? getLineColor(step.line_id) : 'hsl(var(--border))';
    const durationMin = Math.round(step.duration_seconds / 60);

    return (
        <div className="relative pl-8 py-3">
            {!isLast && (
                <div 
                    className="absolute left-[3.5px] top-[calc(1.5rem+8px)] h-full w-1"
                    style={{ backgroundColor: step.type === 'TRANSIT' ? color : 'hsl(var(--border))' }}
                ></div>
             )}
            <div className="flex items-center mb-1">
                <TimelineIcon type={step.type} lineId={step.line_id} />
                <p className="font-semibold text-sm">{step.start_time}</p>
                <p className="ml-4 font-bold">{step.start_stop_name}</p>
            </div>
            
            <div className="relative pl-8">
                {step.type === 'WALK' && (
                     <div className="flex items-center text-sm text-muted-foreground">
                        <p>Marche &middot; {durationMin} min ({step.distance_meters} m)</p>
                    </div>
                )}
                 {step.type === 'TRANSIT' && (
                     <div className="flex flex-col text-sm">
                        <p className="font-semibold" style={{color}}>Ligne {step.line_name}</p>
                        <p className="text-muted-foreground">{durationMin} min &middot; {step.num_stops} arrêts</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ItineraryTimeline({ itinerary }: ItineraryTimelineProps) {
    const lastStep = itinerary.steps[itinerary.steps.length - 1];

    return (
        <div className="p-4 border-t">
            <div className="relative">
                {itinerary.steps.map((step, index) => (
                    <TimelineItem 
                        key={index} 
                        step={step}
                        isLast={index === itinerary.steps.length-1} 
                    />
                ))}

                 {/* Final Destination */}
                <div className="relative pl-8 py-3">
                    <div className="flex items-center">
                        <TimelineIcon type="END" />
                        <p className="font-semibold text-sm">{lastStep.end_time}</p>
                        <p className="ml-4 font-bold">{lastStep.end_stop_name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
