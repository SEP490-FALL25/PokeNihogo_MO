export type SrsContentType = "VOCABULARY" | "KANJI" | "GRAMMAR";

export type SrsVocabularyContent = {
  type: "vocabulary";
  id: number;
  wordJp: string;
  reading?: string | null;
  meaning?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
};

export type SrsKanjiContent = {
  type: "kanji";
  id: number;
  character: string;
  meaning?: string | null;
  jlptLevel?: number | null;
  onReading?: string | null;
  kunReading?: string | null;
};

export type SrsGrammarUsage = {
  id: number;
  explanation: string;
  exampleSentence?: string;
};

export type SrsGrammarContent = {
  type: "grammar";
  id: number;
  structure: string;
  level?: string | null;
  usages?: SrsGrammarUsage[];
};

export type SrsContent =
  | SrsVocabularyContent
  | SrsKanjiContent
  | SrsGrammarContent
  | Record<string, any>;

export interface ISrsReviewItem {
  id: number;
  userId: number;
  message: string;
  contentType: SrsContentType;
  contentId: number;
  isRead: boolean;
  content: SrsContent;
}

export interface ISrsReviewPagination {
  current: number;
  pageSize: number;
  totalPage: number;
  totalItem: number;
}

export interface ISrsReviewData {
  results: ISrsReviewItem[];
  pagination: ISrsReviewPagination;
}

export interface ISrsReviewResponse {
  statusCode: number;
  message: string;
  data: {
    statusCode: number;
    message: string;
    data: ISrsReviewData;
  };
}


