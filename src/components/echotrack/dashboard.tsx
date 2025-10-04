'use client';

import React, { useState, useMemo } from 'react';
import { AppProvider, useAppContext } from '@/context/app-context';
import { Header } from '@/components/echotrack/header';
import { StationCard } from '@/components/echotrack/station-card';
import { SongHistoryDialog } from '@/components/echotrack/song-history';
import { AddStationDialog } from '@/components/echotrack/add-station-dialog';
import { ManageCategoriesDialog } from '@/components/echotrack/manage-categories-dialog';
import { Radio, Plus, ListFilter, X, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

function MainUI() {
  const { stations, categories } = useAppContext();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  const categoryNames = Object.keys(categories);


  const filteredStations = useMemo(() => {
    if (!categoryFilter) {
      return stations;
    }
    return stations.filter(station => station.category === categoryFilter);
  }, [stations, categoryFilter]);
  

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="flex flex-wrap justify-center gap-4 my-8">
          <AddStationDialog isOpen={isAddStationOpen} setIsOpen={setIsAddStationOpen} />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" />
                Kategoriye Göre Filtrele
                {categoryFilter && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs">{categoryFilter}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Bir Kategori Seç</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={!categoryFilter} onCheckedChange={() => setCategoryFilter(null)}>
                Tüm Kategoriler
              </DropdownMenuCheckboxItem>
              {categoryNames.map(category => (
                <DropdownMenuCheckboxItem 
                  key={category} 
                  checked={categoryFilter === category} 
                  onCheckedChange={() => setCategoryFilter(category)}
                >
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categories[category] }} />
                     <span>{category}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <SongHistoryDialog isOpen={isHistoryOpen} setIsOpen={setIsHistoryOpen} />

          <ManageCategoriesDialog isOpen={isManageCategoriesOpen} setIsOpen={setIsManageCategoriesOpen} />

        </div>

        {filteredStations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStations.map(station => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-12 mt-8 max-w-md mx-auto">
            <Radio className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">{categoryFilter ? `"${categoryFilter}" Kategorisinde İstasyon Yok` : "Henüz İstasyon Yok"}</h3>
            <p className="mt-1 text-sm">{categoryFilter ? 'Farklı bir filtre deneyin veya yeni bir istasyon ekleyin.' : 'Başlamak için bir istasyon ekleyin!'}</p>
            {categoryFilter ? (
              <Button onClick={() => setCategoryFilter(null)} className="mt-6" variant="secondary">
                <X className="mr-2 h-4 w-4" />
                Filtreyi Temizle
              </Button>
            ) : (
              <Button onClick={() => setIsAddStationOpen(true)} className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                İlk İstasyonunu Ekle
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function Dashboard() {
  return (
    <AppProvider>
      <MainUI />
    </AppProvider>
  );
}

    