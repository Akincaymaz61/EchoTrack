'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { iconNames, ICONS } from '@/lib/data';

export function AddStationForm({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) {
  const { addStation, categories } = useAppContext();
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState<keyof typeof ICONS>('Radio');
  
  const categoryNames = Object.keys(categories);
  const [category, setCategory] = useState<string>(categoryNames[0] || 'Misc');


  const { toast } = useToast();


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

    addStation({ name, genre, category, url, icon });
    toast({
      title: "İstasyon Eklendi!",
      description: `${name} listeye eklendi.`,
    });

    setIsOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 items-end">
      <div className="space-y-2">
          <label htmlFor="station-name" className="text-sm font-medium">İstasyon Adı</label>
          <Input
            id="station-name"
            placeholder="örn., Deep Space One"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
      </div>
      <div className="space-y-2">
        <label htmlFor="station-genre" className="text-sm font-medium">Tür</label>
        <Input
          id="station-genre"
          placeholder="örn., 80s Retro, Lofi Hip-Hop"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="station-category" className="text-sm font-medium">Kategori</label>
        <div className="flex gap-2">
            <Select value={category} onValueChange={(value) => setCategory(value)}>
                <SelectTrigger id="station-category" className="flex-grow">
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
        <label htmlFor="station-url" className="text-sm font-medium">Yayın URL'si (İsteğe Bağlı)</label>
        <Input
          id="station-url"
          placeholder="https://example.com/stream"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div className="space-y-2">
          <label htmlFor="station-icon" className="text-sm font-medium">İkon</label>
          <Select value={icon} onValueChange={(value) => setIcon(value as keyof typeof ICONS)}>
            <SelectTrigger id="station-icon">
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
      <Button type="submit" className="w-full gap-2">
        <PlusCircle className="mr-2 h-4 w-4" />
        İstasyon Ekle
      </Button>
    </form>
  );
}
