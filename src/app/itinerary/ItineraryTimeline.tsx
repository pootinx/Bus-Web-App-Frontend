
'use client';
import type { ItineraryV2, ItineraryStep } from "@/lib/types";
import { Circle, PersonStanding, Bus } from "lucide-react";
import { getLineColor } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

type ItineraryTimelineProps = {
    itinerary: ItineraryV2;
};

const TimelineNode = ({ type, isLast, lineId }: { type: 'START' | 'END' | 'STEP', isLast?: boolean, lineId?: number }) => {
    const color = lineId ? getLineColor(lineId) : 'hsl(var(--primary))';
    const NodeIcon = type === 'START' ? Circle : type === 'END' ? Circle : div;
    const isStop = type === 'STEP';
    
    return (
        <div className="absolute left-0 -translate-x-1/2 z-10 p-1 bg-background">
            {isStop ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary bg-background" />
            ) : (
                 <Circle className="h-4 w-4" fill={type === 'END' ? 'currentColor' : 'white'} strokeWidth={type === 'START' ? 2 : 1} />
            )}
        </div>
    );
};

const TimelineSegment = ({ step, isLast }: { step: ItineraryStep, isLast: boolean }) => {
    const durationMin = Math.round(step.duration_seconds / 60);
    const color = step.type === 'TRANSIT' && step.line_id ? getLineColor(step.line_id) : 'hsl(var(--border))';
    const lineStyle = step.type === 'WALK' ? 'dotted' : 'solid';

    return (
        <div className="relative pl-8 py-4">
             {!isLast && (
                <div 
                    className="absolute left-[3px] top-10 h-full w-0.5"
                    style={{ 
                        borderRight: lineStyle === 'dotted' ? `2px dotted ${color}` : 'none',
                        backgroundColor: lineStyle === 'solid' ? color : 'transparent'
                    }}
                ></div>
             )}

            <div className="flex items-center mb-1 relative">
                <TimelineNode type="STEP" lineId={step.line_id} />
                <p className="font-semibold text-sm">{step.start_time}</p>
                <p className="ml-4 font-bold">{step.start_stop_name}</p>
            </div>
            
            <div className="pl-8 mt-2 space-y-2">
                {step.type === 'WALK' && (
                     <div className="flex items-center text-sm text-muted-foreground">
                        <PersonStanding className="h-5 w-5 mr-3 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground">Marcher jusqu'à {step.end_stop_name}</span>
                            <span>{durationMin} min ({step.distance_meters} m)</span>
                        </div>
                    </div>
                )}
                 {step.type === 'TRANSIT' && (
                     <div className="flex items-start text-sm">
                        <Bus className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{color}} />
                        <div className="flex flex-col gap-1">
                            <Badge style={{ backgroundColor: color, color: 'white', width: 'fit-content' }}>
                                {step.line_name}
                            </Badge>
                             <p className="font-semibold text-foreground">Direction {step.end_stop_name}</p>
                            <p className="text-muted-foreground">{durationMin} min &middot; {step.num_stops} arrêts</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ItineraryTimeline({ itinerary }: ItineraryTimelineProps) {
    if (!itinerary) return null;

    const lastStep = itinerary.steps[itinerary.steps.length - 1];
    const totalDuration = Math.round(itinerary.duration_seconds / 60);

    return (
        <div className="p-4">
             <div className="mb-4">
                <p className="text-lg">Durée totale: <span className="font-bold">{totalDuration} minutes</span></p>
                <p className="text-muted-foreground text-sm">{itinerary.start_time} - {itinerary.end_time}</p>
            </div>
            <div className="relative">
                {/* Start Point */}
                <div className="relative pl-8 py-4">
                    <div 
                        className="absolute left-[3px] top-10 h-full w-0.5"
                        style={{
                            borderRight: itinerary.steps[0].type === 'WALK' ? `2px dotted hsl(var(--border))` : 'none',
                            backgroundColor: itinerary.steps[0].type === 'WALK' ? 'transparent' : getLineColor(itinerary.steps[0].line_id),
                        }}
                    ></div>
                    <div className="flex items-center relative">
                        <TimelineNode type="START" />
                        <p className="font-semibold text-sm">{itinerary.start_time}</p>
                        <p className="ml-4 font-bold">{itinerary.steps[0].start_stop_name}</p>
                    </div>
                </div>

                {itinerary.steps.map((step, index) => (
                    <TimelineSegment 
                        key={index} 
                        step={step}
                        isLast={index === itinerary.steps.length-1} 
                    />
                ))}

                 {/* Final Destination */}
                <div className="relative pl-8 py-4">
                    <div className="flex items-center relative">
                        <TimelineNode type="END"/>
                        <p className="font-semibold text-sm">{itinerary.end_time}</p>
                        <p className="ml-4 font-bold">{lastStep.end_stop_name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
