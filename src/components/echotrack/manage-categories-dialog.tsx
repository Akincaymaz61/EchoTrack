'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Palette, PlusCircle, Trash2 } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ManageCategoriesDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export function ManageCategoriesDialog({ isOpen, setIsOpen }: ManageCategoriesDialogProps) {
  const { categories, addCategory, removeCategory, stations } = useAppContext();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#888888');
  const { toast } = useToast();

  const categoryNames = Object.keys(categories);

  const categoriesInUse = useMemo(() => {
    const inUse = new Set<string>();
    stations.forEach(station => {
      inUse.add(station.category);
    });
    return inUse;
  }, [stations]);

  const handleAddCategory = () => {
    if (newCategoryName && !categories[newCategoryName]) {
      addCategory(newCategoryName, newCategoryColor);
      toast({
        title: "Kategori Eklendi!",
        description: `"${newCategoryName}" kategorisi oluşturuldu.`,
      });
      setNewCategoryName('');
      setNewCategoryColor('#888888');
    } else {
      toast({
        variant: "destructive",
        title: "Kategori Hatası",
        description: "Kategori adı boş olamaz veya zaten mevcut olamaz.",
      });
    }
  };

  const handleRemoveCategory = (categoryName: string) => {
    if (categoriesInUse.has(categoryName)) {
      toast({
        variant: "destructive",
        title: "Silme Hatası",
        description: `"${categoryName}" kategorisi şu anda bir veya daha fazla istasyon tarafından kullanılıyor. Lütfen önce bu istasyonların kategorisini değiştirin.`,
      });
      return;
    }
    removeCategory(categoryName);
    toast({
      title: "Kategori Silindi",
      description: `"${categoryName}" kategorisi kaldırıldı.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Palette className="mr-2 h-4 w-4" /> Kategorileri Yönet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-3">
            <Palette className="w-6 h-6 text-primary" />
            Kategorileri Yönet
          </DialogTitle>
          <DialogDescription>
            Yeni kategoriler ekleyin, mevcutları silin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Yeni Kategori Ekle</h4>
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
            <Button size="sm" className="w-full mt-2" onClick={handleAddCategory}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ekle
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Mevcut Kategoriler</h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {categoryNames.length > 0 ? categoryNames.map(cat => (
                <div key={cat} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: categories[cat] }} />
                    <span className="font-medium">{cat}</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" disabled={categoriesInUse.has(cat)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu, "{cat}" kategorisini kalıcı olarak silecektir. Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveCategory(cat)}>Sil</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">Henüz kategori yok.</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Kapat</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
