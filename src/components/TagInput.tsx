
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { X, Plus, Tag } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

export const TagInput = ({ tags, onChange, suggestions = [] }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue) {
      // Remove the last tag when backspace is pressed and input is empty
      if (tags.length > 0) {
        handleRemoveTag(tags[tags.length - 1]);
      }
    }
    
    // Show suggestions when typing
    setShowSuggestions(!!inputValue);
  };

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) && 
      !tags.includes(suggestion.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap gap-1.5 bg-background border border-input px-3 py-1 rounded-md">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 rounded-full hover:bg-secondary/80"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <div className="flex-1 flex items-center">
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(!!inputValue)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="border-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground"
            placeholder={tags.length === 0 ? "Add tags..." : ""}
          />
          {inputValue && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => handleAddTag(inputValue)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-14 bg-background border border-input rounded-md shadow-lg max-h-40 overflow-y-auto">
          <ul className="py-1">
            {filteredSuggestions.map(suggestion => (
              <li 
                key={suggestion}
                className="px-3 py-1.5 hover:bg-secondary cursor-pointer text-sm"
                onClick={() => {
                  handleAddTag(suggestion);
                  setShowSuggestions(false);
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
