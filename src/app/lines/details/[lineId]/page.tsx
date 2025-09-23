import { getLineColor } from '@/lib/constants';
import { getLines, getStopsByLine, getTripsByLine } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StopsTimeline } from '../StopsTimeline';
import { TripSchedule } from '../TripSchedule';
import { MapPin } from 'lucide-react';
import { MapProvider } from '../MapProvider';

type LineDetailsPageProps = {
  params: {
    lineId: string;
  };
};

export default async function LineDetailsPage({ params }: LineDetailsPageProps) {
  const lineId = parseInt(params.lineId, 10);
  if (isNaN(lineId)) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTitle>ID de ligne invalide</AlertTitle>
        </Alert>
      </div>
    );
  }

  try {
    const lines = await getLines();
    const line = lines.find((l) => l.id === lineId);
    if (!line) throw new Error('Line not found');

    const stops = await getStopsByLine(lineId);
    const trips = await getTripsByLine(lineId);

    const color = getLineColor(lineId);

    return (
      <div style={{ '--line-color': color } as React.CSSProperties}>
        <header className="sticky top-16 z-40 bg-[var(--line-color)] text-white shadow-md">
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold font-headline">Ligne {line.route_name}</h1>
          </div>
        </header>
        
        <div className="h-80 md:h-96 w-full">
            <MapProvider line={line} stops={stops} />
        </div>

        <div className="container mx-auto max-w-4xl py-8 px-4 space-y-8">
            <section className="text-center">
                 <h2 className="text-xl font-semibold flex items-center justify-center gap-2 flex-wrap">
                    <MapPin className="h-5 w-5 text-green-500" />
                    <span>{line.start_address}</span>
                    <span>&rarr;</span>
                    <MapPin className="h-5 w-5 text-red-500" />
                    <span>{line.end_address}</span>
                 </h2>
                 <p className="text-muted-foreground">{stops.length} arrêts</p>
            </section>
          
          <TripSchedule trips={trips} />
          <StopsTimeline stops={stops} />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'Une erreur est survenue.'}</AlertDescription>
        </Alert>
      </div>
    );
  }
}

export async function generateStaticParams() {
  try {
    const lines = await getLines();
    return lines.map((line) => ({
      lineId: line.id.toString(),
    }));
  } catch (error) {
    console.error("Failed to generate static params for line details:", error);
    return [];
  }
}
