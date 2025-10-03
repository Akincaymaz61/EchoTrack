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
        <Button className="gap-2">
            <PlusCircle className="mr-2 h-4 w-4" /> İstasyon Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Bir İstasyon Ekle</DialogTitle>
            <DialogDescription>
                Bir web radyo istasyonu akışının ayrıntılarını girin.
            </DialogDescription>
        </DialogHeader>
        <AddStationForm setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
}
