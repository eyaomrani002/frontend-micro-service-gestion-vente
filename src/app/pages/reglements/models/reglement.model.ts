// src/app/reglements/models/reglement.model.ts
export interface Reglement {
  id?: number;
  factureId: number;
  montant: number;
  dateReglement: string | Date;
  modePaiement: string; // e.g., MAD, EUR,TND
  reference: string; // e.g., PAY-123
  statut: 'COMPLET' | 'PARTIEL' | 'ANNULE';
}

export interface Facture {
  id: number;
  dateFacture: string | Date;
  total: number;
  status: 'PAYEE' | 'PARTIELLEMENT_PAYEE' | 'NON_PAYEE';
  client: Client;
  factureLignes: FactureLigne[];
}

export interface Client {
  id: number;
  name: string;
}

export interface FactureLigne {
  produit: Produit;
  quantity: number;
  price: number;
}

export interface Produit {
  id: number;
  name: string;
}

export interface Devise {
  id: number;
  code: string; // e.g., MAD, EUR
  name: string;
  tauxChange: number;
  deviseReference: boolean;
}