'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { Bot, Plus, PlusCircle } from 'lucide-react';
import { AddStationForm } from './add-station-form';
import { StationSuggestions } from './station-suggestions';

type AddStationDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export function AddStationDialog({ isOpen, setIsOpen }: AddStationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Station
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Tabs defaultValue="suggest">
            <DialogHeader className="px-0">
                <DialogTitle className="font-headline text-2xl">Find & Add Stations</DialogTitle>
                <DialogDescription>
                    <TabsList className="grid w-full grid-cols-2 mt-4">
                        <TabsTrigger value="suggest"><Bot className="mr-2" /> AI Suggestions</TabsTrigger>
                        <TabsTrigger value="manual"><Plus className="mr-2" /> Add Manually</TabsTrigger>
                    </TabsList>
                </DialogDescription>
            </DialogHeader>
            <TabsContent value="suggest" className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                    Describe a genre or vibe, and our AI will find working stations for you.
                </p>
                <StationSuggestions />
            </TabsContent>
            <TabsContent value="manual" className="pt-4">
                 <p className="text-sm text-muted-foreground mb-4">
                    Enter the details of a web radio station stream.
                </p>
                <AddStationForm />
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
