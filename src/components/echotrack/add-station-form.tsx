'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { iconNames, ICONS } from '@/lib/data';
import { CATEGORIES } from '@/lib/categories';

const categoryNames = Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[];

export function AddStationForm() {
  const { addStation } = useAppContext();
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState<keyof typeof ICONS>('Radio');
  const [category, setCategory] = useState<keyof typeof CATEGORIES>(categoryNames[0]);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !genre || !category) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Station Name, Genre, and Category are required.",
      });
      return;
    }

    addStation({ name, genre, category, url, icon });
    toast({
      title: "Station Added!",
      description: `${name} has been added to your list.`,
    });

    // Reset form
    setName('');
    setGenre('');
    setUrl('');
    setIcon('Radio');
    setCategory(categoryNames[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 items-end">
      <div className="space-y-2">
          <label htmlFor="station-name" className="text-sm font-medium">Station Name</label>
          <Input
            id="station-name"
            placeholder="e.g., Deep Space One"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
      </div>
      <div className="space-y-2">
        <label htmlFor="station-genre" className="text-sm font-medium">Genre</label>
        <Input
          id="station-genre"
          placeholder="e.g., 80s Retro, Lofi Hip-Hop"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="station-category" className="text-sm font-medium">Category</label>
        <Select value={category} onValueChange={(value) => setCategory(value as keyof typeof CATEGORIES)}>
            <SelectTrigger id="station-category">
                <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
                {categoryNames.map(cat => (
                    <SelectItem key={cat} value={cat}>
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORIES[cat] }} />
                           <span>{cat}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="station-url" className="text-sm font-medium">Stream URL (Optional)</label>
        <Input
          id="station-url"
          placeholder="https://example.com/stream"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div className="space-y-2">
          <label htmlFor="station-icon" className="text-sm font-medium">Icon</label>
          <Select value={icon} onValueChange={(value) => setIcon(value as keyof typeof ICONS)}>
            <SelectTrigger id="station-icon">
                <SelectValue placeholder="Select an icon" />
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
      <Button type="submit" className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Station
      </Button>
    </form>
  );
}
