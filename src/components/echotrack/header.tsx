import { Radio } from 'lucide-react';

export function Header() {
  return (
    <header className="flex flex-col items-center text-center">
      <div className="flex items-center gap-3">
        <Radio className="w-10 h-10 text-primary" />
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter text-primary">
          EchoTrack
        </h1>
      </div>
      <p className="mt-2 text-lg text-muted-foreground">
        Discover and track songs from AI-powered radio stations.
      </p>
    </header>
  );
}
