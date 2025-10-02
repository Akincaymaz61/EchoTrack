'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { iconNames, ICONS } from '@/lib/data';
import type { Station } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Pencil } from 'lucide-react';

type EditStationFormProps = {
  station: Station;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export function EditStationForm({ station, isOpen, setIsOpen }: EditStationFormProps) {
  const { updateStation, categories } = useAppContext();
  const [name, setName] = useState(station.name);
  const [genre, setGenre] = useState(station.genre);
  const [url, setUrl] = useState(station.url || '');
  const [icon, setIcon] = useState<keyof typeof ICONS>(station.icon);
  
  const categoryNames = Object.keys(categories);
  const [category, setCategory] = useState<string>(station.category);

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setName(station.name);
      setGenre(station.genre);
      setUrl(station.url || '');
      setIcon(station.icon);
      setCategory(station.category);
    }
  }, [isOpen, station]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !genre || !category) {
      toast({
        variant: "destructive",
        title: "Doğrulama Hatası",
        description: "İstasyon Adı, Tür ve Kategori gereklidir.",
      });
      return;
    }

    updateStation(station.id, { name, genre, category, url, icon });
    toast({
      title: "İstasyon Güncellendi!",
      description: `${name} güncellendi.`,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            İstasyonu Düzenle
          </DialogTitle>
          <DialogDescription>
            "{station.name}" için ayrıntıları güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 py-4">
          <div className="space-y-2">
             <label htmlFor="edit-station-name" className="text-sm font-medium">İstasyon Adı</label>
             <Input
                id="edit-station-name"
                placeholder="örn., Deep Space One"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-station-genre" className="text-sm font-medium">Tür</label>
            <Input
                id="edit-station-genre"
                placeholder="örn., 80s Retro, Lofi Hip-Hop"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-station-category" className="text-sm font-medium">Kategori</label>
             <div className="flex gap-2">
                <Select value={category} onValueChange={(value) => setCategory(value as keyof typeof categories)}>
                    <SelectTrigger id="edit-station-category" className="flex-grow">
                        <SelectValue placeholder="Bir kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                        {categoryNames.map(cat => (
                            <SelectItem key={cat} value={cat}>
                               <div className="flex items-center gap-2">
                                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categories[cat] }} />
                                   <span>{cat}</span>
                               </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="edit-station-url" className="text-sm font-medium">Yayın URL'si (İsteğe Bağlı)</label>
            <Input
              id="edit-station-url"
              placeholder="https://example.com/stream"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
             <label htmlFor="edit-station-icon" className="text-sm font-medium">İkon</label>
             <Select value={icon} onValueChange={(value) => setIcon(value as keyof typeof ICONS)}>
                <SelectTrigger id="edit-station-icon">
                    <SelectValue placeholder="Bir ikon seçin" />
                </SelectTrigger>
                <SelectContent>
                    {iconNames.map(iconName => {
                        const IconComponent = ICONS[iconName];
                        return (
                            <SelectItem key={iconName} value={iconName}>
                                <div className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" />
                                    <span>{iconName}</span>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>İptal</Button>
            <Button type="submit">Değişiklikleri Kaydet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
