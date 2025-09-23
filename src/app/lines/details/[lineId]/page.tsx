import { getLineColor } from '@/lib/constants';
import { getLines, getStopsByLine } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StopsTimeline } from '../StopsTimeline';
import { MapProvider } from '../MapProvider';
import { LineDetails } from '../LineDetails';

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
    const color = getLineColor(lineId);

    return (
      <div style={{ '--line-color': color } as React.CSSProperties} className="h-[calc(100vh-4rem)]">
        <div className="flex flex-col md:flex-row h-full">
            <div className="md:w-1/3 lg:w-1/4 h-full border-r overflow-y-auto">
                <LineDetails line={line} stops={stops} />
            </div>
            <div className="flex-1 h-full">
                 <MapProvider line={line} stops={stops} />
            </div>
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
