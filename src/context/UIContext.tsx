import React, { createContext, useState, useMemo, type ReactNode } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { translations, type Language } from '../i18n/translations';
import type { IssueType, Priority, ViewMode } from '../types/Aether';

export interface UIContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onlyMyIssues: boolean;
  setOnlyMyIssues: Dispatch<SetStateAction<boolean>>;
  selectedEpicId: string | null;
  setSelectedEpicId: (id: string | null) => void;
  selectedType: IssueType | 'all';
  setSelectedType: (type: IssueType | 'all') => void;
  selectedPriority: Priority | 'all';
  setSelectedPriority: (priority: Priority | 'all') => void;
  selectedLabel: string | null;
  setSelectedLabel: (label: string | null) => void;

  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const UIContext = createContext<UIContextValue | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
  initialTheme?: 'light' | 'dark';
  initialLanguage?: Language;
  initialAccentColor?: string;
}

export const UIProvider: React.FC<UIProviderProps> = ({
  children,
  initialTheme = 'dark',
  initialLanguage = 'ko',
  initialAccentColor = '#6366F1',
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);
  const [accentColor, setAccentColor] = useState<string>(initialAccentColor);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [viewMode, setViewMode] = useState<ViewMode>('board');

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMyIssues, setOnlyMyIssues] = useState(false);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<IssueType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const t = useMemo(() => {
    return (key: string): string => {
      const currentDict = translations[language] || translations.ko;
      return currentDict[key as keyof typeof currentDict] || key;
    };
  }, [language]);

  const value = useMemo<UIContextValue>(() => ({
    theme,
    toggleTheme,
    accentColor,
    setAccentColor,
    language,
    setLanguage,
    t,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    onlyMyIssues,
    setOnlyMyIssues,
    selectedEpicId,
    setSelectedEpicId,
    selectedType,
    setSelectedType,
    selectedPriority,
    setSelectedPriority,
    selectedLabel,
    setSelectedLabel,
    selectedIssueId,
    setSelectedIssueId,
    isCreateModalOpen,
    setIsCreateModalOpen,
  }), [
    theme,
    accentColor,
    language,
    t,
    viewMode,
    searchQuery,
    onlyMyIssues,
    selectedEpicId,
    selectedType,
    selectedPriority,
    selectedLabel,
    selectedIssueId,
    isCreateModalOpen,
  ]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
