import Link from 'next/link';
import type { BusLine } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, ChevronRight, MapPin } from 'lucide-react';
import { getLineColor } from '@/lib/constants';

type LineCardProps = {
  line: BusLine;
};

export function LineCard({ line }: LineCardProps) {
  const color = getLineColor(line.id);

  return (
    <Link href={`/lines/details/${line.id}`}>
      <Card className="hover:shadow-xl hover:border-primary transition-all duration-200 overflow-hidden">
        <CardContent className="p-0 flex items-stretch">
          <div className="p-4 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: color }}>
            <Bus className="h-8 w-8 text-white" />
          </div>
          <div className="flex-grow p-4">
            <Badge style={{ backgroundColor: color, color: 'white' }}>Ligne {line.route_name}</Badge>
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="font-medium">{line.start_address}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="font-medium">{line.end_address}</span>
              </div>
            </div>
          </div>
          <div className="p-4 flex items-center justify-center bg-muted/30">
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
