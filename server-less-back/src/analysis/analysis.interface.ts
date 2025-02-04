export interface Anomaly {
  ligne: number;
  valeur: number;
  raison: string;
}

export interface StatisticsResult {
  prix: {
    moyenne: number;
    mediane: number;
    ecartType: number;
  };
  quantite: {
    moyenne: number;
    mediane: number;
    ecartType: number;
  };
  note: {
    moyenne: number;
    mediane: number;
    ecartType: number;
  };
}

export interface AnomaliesResult {
  prix: Anomaly[];
  quantite: Anomaly[];
  note: Anomaly[];
}

export interface CSVRow {
  ID: number;
  Nom: string;
  Prix: number;
  Quantité: number;
  Note_Client: number;
}
