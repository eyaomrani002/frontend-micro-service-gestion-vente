export interface Produit {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  categorie?: Categorie;
  version?: number;
}

export interface Categorie {
  id?: number;
  name?: string;
  description?: string;
}