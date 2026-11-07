export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  caption: string;
  location?: string;
  imageUrl: string;
  rotation: number;
  tags: string[];
}

export interface BirthdayData {
  recipient: {
    name: string;
    nickname: string;
    age: number;
    birthDate: string;
    occasion: string;
  };
  headlines: {
    main: string;
    secondary: string;
    tagline: string;
    closing: string;
  };
  letter: {
    title: string;
    salutation: string;
    body: string[];
    closing: string;
    sender: string;
  };
  secretMessage: string;
  celebration: {
    main: string;
    secondary: string;
  };
  wishes: Array<{
    quote: string;
    author: string;
  }>;
  memories: MemoryItem[];
}

