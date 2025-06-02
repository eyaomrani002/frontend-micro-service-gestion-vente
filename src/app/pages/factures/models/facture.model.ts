import { Client, Produit } from "../../reglements/models/reglement.model";

export interface Facture {
  id?: number;
  dateFacture?: Date | string;
  status: string; // NON_PAYEE, PARTIELLEMENT_PAYEE, PAYEE
  total?: number;
  resteAPayer?: number;
  montantPaye?: number;
  clientID: number;
  client?: Client; // Added for display
  factureLignes?: FactureLigne[];
}

export interface FactureLigne {
  id?: number;
  produitID: number;
  quantity: number;
  price: number;
  produit?: Produit; // Added for display
}