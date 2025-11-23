declare namespace IComponents {
  export interface IButton {
    title: string;
    onPress: () => void;
    variant: "primary" | "secondary" | "outline" | "ghost";
    size: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
  }

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
}
