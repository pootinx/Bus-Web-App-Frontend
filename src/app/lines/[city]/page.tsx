import { getLines } from '@/lib/api';
import type { BusLine } from '@/lib/types';
import { LineCard } from '@/components/LineCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Frown } from 'lucide-react';
import { CITIES } from '@/lib/constants';

type LinesByCityPageProps = {
  params: {
    city: string;
  };
};

export default async function LinesByCityPage({ params }: LinesByCityPageProps) {
  const { city } = params;
  const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
  const cityInfo = CITIES.find(c => c.name.toLowerCase() === city.toLowerCase());
  
  let lines: BusLine[] = [];
  let error: string | null = null;
  
  if (!cityInfo) {
    error = `La ville "${capitalizedCity}" n'est pas supportée.`;
  } else {
    try {
      lines = await getLines(cityInfo.id);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to fetch bus lines.';
    }
  }


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
      {!error && lines.length === 0 && (
         <Alert>
            <Frown className="h-4 w-4" />
           <AlertTitle>Aucune ligne trouvée</AlertTitle>
           <AlertDescription>Aucune ligne de bus n'a été trouvée pour cette ville.</AlertDescription>
         </Alert>
      )}
      <div className="grid gap-6 sm:grid-cols-1">
        {lines.map((line) => (
          <LineCard key={line.id} line={line} />
        ))}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
    return CITIES.map(city => ({ city: city.name.toLowerCase() }));
}
