// Dictionary Types
export interface WordMeaning {
  meaning?: string;
  exampleSentenceJp?: string;
  exampleSentence?: string;
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

