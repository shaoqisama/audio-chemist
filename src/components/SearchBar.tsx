
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
}

export interface SearchFilters {
  types: Record<string, boolean>;
  tags: string[];
  favorites: boolean;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    types: {
      kick: false,
      snare: false, 
      hihat: false,
      melody: false,
      bass: false,
      other: false
    },
    tags: [],
    favorites: false
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setFilters({
      types: {
        kick: false,
        snare: false, 
        hihat: false,
        melody: false,
        bass: false,
        other: false
      },
      tags: [],
      favorites: false
    });
    onSearch('', {
      types: {},
      tags: [],
      favorites: false
    });
  };

  const handleTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type]
      }
    }));
  };

  const handleFavoritesToggle = () => {
    setFilters(prev => ({
      ...prev,
      favorites: !prev.favorites
    }));
  };

  const activeFilterCount = 
    Object.values(filters.types).filter(Boolean).length + 
    filters.tags.length + 
    (filters.favorites ? 1 : 0);

  return (
    <div className="flex space-x-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search samples..."
          className="pl-8 pr-8 h-9 text-sm"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {(query || activeFilterCount > 0) && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-9 w-9"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className={`h-9 w-9 ${activeFilterCount > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem 
            checked={filters.types.kick}
            onCheckedChange={() => handleTypeToggle('kick')}
          >
            Kick
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem 
            checked={filters.types.snare}
            onCheckedChange={() => handleTypeToggle('snare')}
          >
            Snare
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem 
            checked={filters.types.hihat}
            onCheckedChange={() => handleTypeToggle('hihat')}
          >
            Hi-Hat
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem 
            checked={filters.types.melody}
            onCheckedChange={() => handleTypeToggle('melody')}
          >
            Melody
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem 
            checked={filters.types.bass}
            onCheckedChange={() => handleTypeToggle('bass')}
          >
            Bass
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem 
            checked={filters.types.other}
            onCheckedChange={() => handleTypeToggle('other')}
          >
            Other
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Other Filters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem 
            checked={filters.favorites}
            onCheckedChange={handleFavoritesToggle}
          >
            Favorites Only
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button onClick={handleSearch} className="h-9 hidden xs:flex">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  );
};
