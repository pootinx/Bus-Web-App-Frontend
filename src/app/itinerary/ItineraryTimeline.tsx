
'use client';
import type { ItineraryV2, ItineraryStep } from "@/lib/types";
import { Circle, PersonStanding, Bus } from "lucide-react";
import { getLineColor } from "@/lib/constants";

type ItineraryTimelineProps = {
    itinerary: ItineraryV2;
};

const TimelineIcon = ({ type, lineId }: { type: ItineraryStep['type'] | 'START' | 'END', lineId?: number }) => {
    const iconWrapperClass = "absolute left-0 -translate-x-1/2 z-10 p-1 bg-background rounded-full";
    const color = type === 'TRANSIT' && lineId ? getLineColor(lineId) : 'hsl(var(--primary))';

    switch (type) {
        case 'START':
        case 'END':
            return (
                <div className={iconWrapperClass}>
                    <Circle className="h-3.5 w-3.5" fill="currentColor" strokeWidth={1} style={{color: 'hsl(var(--primary))'}} />
                </div>
            );
        case 'WALK':
             return (
                <div className={`${iconWrapperClass} bg-transparent p-0`}>
                    <div className="h-3.5 w-3.5 bg-background rounded-full flex items-center justify-center">
                        <Circle className="h-1.5 w-1.5" fill="hsl(var(--muted-foreground))" strokeWidth={0} />
                    </div>
                </div>
            );
        case 'TRANSIT':
            return (
                <div className={iconWrapperClass}>
                     <Circle className="h-3.5 w-3.5" fill={color} strokeWidth={1} stroke={color}/>
                </div>
            );
        default:
            return null;
    }
};

const TimelineItem = ({ step, isLast, isFirst }: { step: ItineraryStep, isLast: boolean, isFirst: boolean }) => {
    const color = step.line_id ? getLineColor(step.line_id) : 'hsl(var(--border))';
    const durationMin = Math.round(step.duration_seconds / 60);

    return (
        <div className="relative pl-8 py-3">
            {!isLast && (
                <div 
                    className="absolute left-[3.5px] top-[calc(1.5rem+8px)] h-full w-1"
                    style={{ backgroundColor: step.type === 'TRANSIT' && step.line_id ? getLineColor(step.line_id) : 'hsl(var(--border))' }}
                ></div>
             )}

            {/* Start point of the step */}
            <div className="flex items-center mb-1">
                <TimelineIcon type={isFirst ? 'START' : step.type} lineId={step.line_id} />
                <p className="font-semibold text-sm">{step.start_time}</p>
                <p className="ml-4 font-bold">{step.start_stop_name}</p>
            </div>
            
            {/* The actual travel part */}
            <div className="relative pl-8">
                {step.type === 'WALK' && (
                     <div className="flex items-center text-sm text-muted-foreground my-2">
                        <PersonStanding className="h-4 w-4 mr-2" />
                        <p>Marche &middot; {durationMin} min ({step.distance_meters} m)</p>
                    </div>
                )}
                 {step.type === 'TRANSIT' && (
                     <div className="flex items-start text-sm my-2">
                        <Bus className="h-5 w-5 mr-2" style={{color}} />
                        <div className="flex flex-col">
                            <p className="font-semibold" style={{color}}>Ligne {step.line_name}</p>
                            <p className="text-muted-foreground">{durationMin} min &middot; {step.num_stops} arrêts</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ItineraryTimeline({ itinerary }: ItineraryTimelineProps) {
    const lastStep = itinerary.steps[itinerary.steps.length - 1];

    return (
        <div className="p-4">
            <div className="relative">
                {itinerary.steps.map((step, index) => (
                    <TimelineItem 
                        key={index} 
                        step={step}
                        isFirst={index === 0}
                        isLast={index === itinerary.steps.length-1} 
                    />
                ))}

                 {/* Final Destination */}
                <div className="relative pl-8 py-3">
                    <div className="flex items-center">
                        <TimelineIcon type="END"/>
                        <p className="font-semibold text-sm">{lastStep.end_time}</p>
                        <p className="ml-4 font-bold">{lastStep.end_stop_name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
