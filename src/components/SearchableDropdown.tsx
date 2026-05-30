import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { tokens, DT } from '../lib/designTokens';

interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  allowCustom?: boolean;
  className?: string;
  controlClassName?: string;
  controlStyle?: CSSProperties;
  textSize?: 'xs' | 'sm';
  disabled?: boolean;
}

export default function SearchableDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  allowCustom = true,
  className = '',
  controlClassName = `px-4 py-2.5 ${DT.radius.md}`,
  controlStyle,
  textSize = 'sm',
  disabled = false
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    inputRef.current?.focus();
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        onClick={handleInputClick}
        className={cn(
          'w-full border cursor-pointer transition-all',
          'focus-within:ring-2 focus-within:ring-red-200 focus-within:border-transparent',
          isOpen && 'ring-2 ring-red-200 border-transparent',
          disabled && 'opacity-50 cursor-not-allowed',
          controlClassName
        )}
        style={controlStyle}
      >
        {isOpen ? (
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'flex-1 font-semibold bg-transparent outline-none min-w-0',
                textSize === 'xs' ? 'text-xs' : 'text-sm'
              )}
              style={{ color: tokens.colors.accentNavy }}
              autoFocus
            />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span 
              className={cn(
                'truncate min-w-0',
                'font-semibold',
                textSize === 'xs' ? 'text-xs' : 'text-sm',
                value ? '' : 'text-slate-400'
              )}
              style={value ? { color: tokens.colors.accentNavy } : {}}
            >
              {value || placeholder}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {value && (
                <X 
                  className="w-4 h-4 text-slate-400 hover:text-slate-600" 
                  onClick={handleClear}
                />
              )}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div 
          className={`absolute z-50 w-full mt-1 ${DT.radius.md} border ${DT.shadow.lg} max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 ${DT.transition.fast}`}
          style={{ backgroundColor: tokens.colors.cardInnerBg, borderColor: tokens.colors.lightBorder }}
        >
          {filteredOptions.length === 0 && !allowCustom ? (
            <div className={cn('px-4 py-3 text-slate-400 italic', textSize === 'xs' ? 'text-xs' : 'text-sm')}>
              No options found
            </div>
          ) : (
            <>
              {filteredOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'px-4 py-2.5 cursor-pointer transition-colors whitespace-normal break-words',
                    textSize === 'xs' ? 'text-xs font-medium' : 'text-sm font-medium',
                    option === value 
                      ? 'bg-red-50 text-red-600 font-bold' 
                      : 'hover:bg-slate-50'
                  )}
                  style={option !== value ? { color: tokens.colors.accentNavy } : {}}
                >
                  {option}
                </div>
              ))}
              
              {allowCustom && searchTerm && !filteredOptions.includes(searchTerm) && (
                <div
                  onClick={() => handleSelect(searchTerm)}
                  className="px-4 py-2.5 cursor-pointer hover:bg-slate-50 border-t"
                  style={{ borderColor: tokens.colors.lighterBorder }}
                >
                  <span className={cn(textSize === 'xs' ? 'text-xs text-slate-500' : 'text-sm text-slate-500')}>
                    Add: <span className="font-bold" style={{ color: tokens.colors.accentNavy }}>"{searchTerm}"</span>
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
