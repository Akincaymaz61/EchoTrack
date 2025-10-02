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
import { Pencil, Palette } from 'lucide-react';

type EditStationFormProps = {
  station: Station;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export function EditStationForm({ station, isOpen, setIsOpen }: EditStationFormProps) {
  const { updateStation, categories, addCategory } = useAppContext();
  const [name, setName] = useState(station.name);
  const [genre, setGenre] = useState(station.genre);
  const [url, setUrl] = useState(station.url || '');
  const [icon, setIcon] = useState<keyof typeof ICONS>(station.icon);
  
  const categoryNames = Object.keys(categories);
  const [category, setCategory] = useState<string>(station.category);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#888888');

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
  
  const handleAddCategory = () => {
    if (newCategoryName && !categories[newCategoryName]) {
      addCategory(newCategoryName, newCategoryColor);
      setCategory(newCategoryName);
      setNewCategoryName('');
      setNewCategoryColor('#888888');
      setIsAddingCategory(false);
      toast({
        title: "Kategori Eklendi!",
        description: `"${newCategoryName}" kategorisi oluşturuldu.`,
      });
    } else {
       toast({
        variant: "destructive",
        title: "Kategori Hatası",
        description: "Kategori adı boş olamaz veya zaten mevcut olamaz.",
      });
    }
  }


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
                <Button type="button" variant="outline" size="icon" onClick={() => setIsAddingCategory(!isAddingCategory)}>
                    <Palette className="w-4 h-4" />
                </Button>
            </div>
          </div>
          
           {isAddingCategory && (
                <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
                    <h4 className="font-medium text-sm">Yeni Kategori Ekle</h4>
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Yeni Kategori Adı" 
                            value={newCategoryName} 
                            onChange={e => setNewCategoryName(e.target.value)}
                        />
                        <div className="relative h-10 w-10">
                            <input 
                                type="color" 
                                value={newCategoryColor} 
                                onChange={e => setNewCategoryColor(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: newCategoryColor }} />
                        </div>
                    </div>
                    <Button type="button" size="sm" className="w-full" onClick={handleAddCategory}>Yeni Kategoriyi Ekle</Button>
                </div>
            )}

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
