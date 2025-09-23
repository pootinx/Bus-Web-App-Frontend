import { getLines } from '@/lib/api';
import type { BusLine } from '@/lib/types';
import { LineCard } from '@/components/LineCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Frown } from 'lucide-react';

type LinesByCityPageProps = {
  params: {
    city: string;
  };
};

// Basic logic to filter lines by city from address strings.
// This is a placeholder until a proper city API or filter is available.
function filterLinesByCity(lines: BusLine[], city: string): BusLine[] {
  const normalizedCity = city.toLowerCase();
  return lines.filter(
    (line) =>
      line.start_address.toLowerCase().includes(normalizedCity) ||
      line.end_address.toLowerCase().includes(normalizedCity) ||
      (normalizedCity === 'casablanca' && line.end_address.toLowerCase().includes('casa'))
  );
}

export default async function LinesByCityPage({ params }: LinesByCityPageProps) {
  const { city } = params;
  const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
  
  let allLines: BusLine[] = [];
  let error: string | null = null;
  
  try {
    allLines = await getLines();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to fetch bus lines.';
  }

  const filteredLines = error ? [] : filterLinesByCity(allLines, city);

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center font-headline">
        Lignes à {capitalizedCity}
      </h1>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!error && filteredLines.length === 0 && (
         <Alert>
            <Frown className="h-4 w-4" />
           <AlertTitle>Aucune ligne trouvée</AlertTitle>
           <AlertDescription>Aucune ligne de bus n'a été trouvée pour cette ville.</AlertDescription>
         </Alert>
      )}
      <div className="grid gap-6 sm:grid-cols-1">
        {filteredLines.map((line) => (
          <LineCard key={line.id} line={line} />
        ))}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
    // This could be replaced with an API call to get all cities
    return [{ city: 'casablanca' }, { city: 'tetouane' }];
}
