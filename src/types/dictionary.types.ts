// Dictionary Types
export interface WordMeaning {
  id?: number;
  meaning?: string;
  exampleSentenceJp?: string;
  exampleSentence?: string;
  wordType?: string | null;
}

export interface RelatedWord {
  id: number | string;
  wordJp: string;
}

export interface SearchHistoryItem {
  id: number;
  searchKeyword: string;
  createdAt: string;
}

