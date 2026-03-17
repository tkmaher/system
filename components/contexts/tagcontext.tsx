import { createContext, useState, useContext } from 'react';

const TagContext = createContext<{
  tags: Set<string>;
  setTags: React.Dispatch<React.SetStateAction<Set<string>>>;
  tagList: Set<string>;
  setTagList: React.Dispatch<React.SetStateAction<Set<string>>>;
} | null>(null);

export const useTags = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const TagProvider = ({ children }: {children: React.ReactNode}) => {
  const [tagList, setTagList] = useState(() => new Set<string>());
  const [tags, setTags] = useState(() => new Set<string>());


  return (
    <TagContext.Provider value={{ tags, setTags, tagList, setTagList }}>
      {children}
    </TagContext.Provider>
  );
};
