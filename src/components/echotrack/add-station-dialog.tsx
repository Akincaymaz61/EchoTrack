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
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddStationForm } from './add-station-form';

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
        <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Add a Station</DialogTitle>
            <DialogDescription>
                Enter the details of a web radio station stream.
            </DialogDescription>
        </DialogHeader>
        <AddStationForm />
      </DialogContent>
    </Dialog>
  );
}
