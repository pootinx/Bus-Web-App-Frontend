'use client';

import { useState } from 'react';
import type { Stop } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Milestone, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getLinesByStop } from '@/lib/api';
import type { BusLine } from '@/lib/types';
import { LineCard } from '@/components/LineCard';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function StopLinesModal({ stop }: { stop: Stop }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<BusLine[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFetchLines = async () => {
    if (lines) return; // Already fetched
    setIsLoading(true);
    try {
      const fetchedLines = await getLinesByStop(stop.id);
      setLines(fetchedLines);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les lignes pour cet arrêt.',
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFetchLines}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Lignes desservant l'arrêt "{stop.name}"</DialogTitle>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {isLoading && <div className="space-y-2"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>}
          {lines && lines.length > 0 && (
            <div className="space-y-4">
              {lines.map((line) => <LineCard key={line.id} line={line} />)}
            </div>
          )}
          {lines && lines.length === 0 && <p>Aucune autre ligne ne dessert cet arrêt.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StopsTimeline({ stops }: { stops: Stop[] }) {
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Milestone />
            <span>Arrêts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6">
            <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
            {stops.map((stop, index) => (
              <div key={stop.id} className="relative flex items-center gap-4 py-3">
                <div className="absolute left-6 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-1 bg-background rounded-full">
                  <div className="h-3 w-3 rounded-full bg-[var(--line-color)] border-2 border-background"></div>
                </div>
                <div className="flex-grow font-medium">{stop.name}</div>
                <StopLinesModal stop={stop} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
