export interface Devise {
  id: number;
  code: string; // e.g., "MAD", "EUR"
  name: string;
  tauxChange: number;
  deviseReference: boolean;
}