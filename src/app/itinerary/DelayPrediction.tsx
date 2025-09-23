'use client';

import { useState } from 'react';
import { BrainCircuit, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getDelayPrediction } from '@/app/actions';
import type { PredictDelayOutput } from '@/ai/flows/real-time-delay-prediction';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type DelayPredictionProps = {
  routeName: string;
  startAddress: string;
  endAddress: string;
};

export default function DelayPrediction({
  routeName,
  startAddress,
  endAddress,
}: DelayPredictionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictDelayOutput | null>(null);
  const { toast } = useToast();

  const handlePrediction = async () => {
    setIsLoading(true);
    setPrediction(null);
    try {
      const currentTime = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const result = await getDelayPrediction({
        routeName,
        startAddress,
        endAddress,
        currentTime,
      });
      setPrediction(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de prédiction',
        description: error instanceof Error ? error.message : 'Une erreur est survenue.',
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" onClick={handlePrediction}>
          <BrainCircuit className="mr-2 h-4 w-4" />
          Prédire le retard (IA)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prédiction de retard pour la ligne {routeName}</DialogTitle>
          <DialogDescription>
            Analyse en temps réel basée sur les données de trafic et l'historique.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-4">Analyse en cours...</span>
          </div>
        ) : prediction ? (
          <div className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle className="text-2xl font-bold">
                {prediction.estimatedDelayMinutes} minutes
              </AlertTitle>
              <AlertDescription>Retard estimé</AlertDescription>
            </Alert>
            <div className="flex items-center gap-2">
                <span>Niveau de confiance :</span>
                <Badge className={`${getConfidenceColor(prediction.confidenceLevel)} text-white`}>
                    {prediction.confidenceLevel}
                </Badge>
            </div>
            {prediction.alternateRouteSuggestion && (
              <Alert variant="default" className="bg-secondary">
                <BrainCircuit className="h-4 w-4" />
                <AlertTitle>Suggestion d'itinéraire alternatif</AlertTitle>
                <AlertDescription>{prediction.alternateRouteSuggestion}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
