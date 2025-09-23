import { CITIES } from '@/lib/constants';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, ChevronRight } from 'lucide-react';

export default function LinesPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center font-headline">
        Lignes de bus
      </h1>
      <div className="grid gap-4 md:grid-cols-2">
        {CITIES.map((city) => (
          <Link href={`/lines/${city.name.toLowerCase()}`} key={city.name}>
            <Card className="hover:shadow-lg hover:border-primary transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <Building className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline text-xl">{city.name}</CardTitle>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
