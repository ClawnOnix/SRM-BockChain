// src/utils/medicationRisk.ts

export type MedicationRisk = "Alto riesgo" | "Riesgo moderado" | "Normal";

export const medicationRiskDict: Record<string, MedicationRisk> = {
  // Alto riesgo
  "Codeína 30 mg": "Alto riesgo",
  "Tramadol 50 mg": "Alto riesgo",
  "Morfina 10 mg": "Alto riesgo",
  "Dexametasona 0.5 mg": "Alto riesgo",
  "Insulina NPH 100 UI/ml": "Alto riesgo",
  "Vancomicina 1 g": "Alto riesgo",

  // Riesgo moderado
  "Ibuprofeno 400 mg": "Riesgo moderado",
  "Diclofenaco sódico 50 mg": "Riesgo moderado",
  "Naproxeno 500 mg": "Riesgo moderado",
  "Amoxicilina 500 mg": "Riesgo moderado",
  "Amoxicilina + Ácido clavulánico 500/125 mg": "Riesgo moderado",
  "Ampicilina 500 mg": "Riesgo moderado",
  "Dicloxacilina 500 mg": "Riesgo moderado",
  "Ceftriaxona 1 g": "Riesgo moderado",
  "Cefotaxima 1 g": "Riesgo moderado",
  "Cefadroxilo 500 mg": "Riesgo moderado",
  "Ciprofloxacina 500 mg": "Riesgo moderado",
  "Levofloxacina 500 mg": "Riesgo moderado",
  "Claritromicina 500 mg": "Riesgo moderado",
  "Eritromicina 500 mg": "Riesgo moderado",
  "Metronidazol 500 mg": "Riesgo moderado",
  "Nitrofurantoína 100 mg": "Riesgo moderado",
  "Doxiciclina 100 mg": "Riesgo moderado",
  "Tetraciclina 500 mg": "Riesgo moderado",
  "Nistatina 500 000 UI": "Riesgo moderado",
  "Fluconazol 100 mg": "Riesgo moderado",
  "Ketoconazol 200 mg": "Riesgo moderado",
  "Albendazol 400 mg": "Riesgo moderado",
  "Mebendazol 100 mg": "Riesgo moderado",
  "Ivermectina 6 mg": "Riesgo moderado",
  "Prazicuantel 600 mg": "Riesgo moderado",
  "Tinidazol 500 mg": "Riesgo moderado",
  "Aciclovir 400 mg": "Riesgo moderado",
  "Zidovudina + Lamivudina 300/150 mg": "Riesgo moderado",
  "Glibenclamida 5 mg": "Riesgo moderado",
  "Metformina 850 mg": "Riesgo moderado",
  "Amlodipino 10 mg": "Riesgo moderado",
  "Enalapril 20 mg": "Riesgo moderado",
  "Losartán 50 mg": "Riesgo moderado",
  "Hidroclorotiazida 25 mg": "Riesgo moderado",
  "Furosemida 40 mg": "Riesgo moderado",

  // Normal
  "Acetaminofén 500 mg": "Normal",
  "Loratadina 10 mg": "Normal",
  "Difenhidramina 25 mg": "Normal",
  "Salbutamol 90 mcg (inhalador)": "Normal",
  "Beclometasona 250 mcg (inhalador)": "Normal",
  "Ipratropio bromuro 0.2 mg (inhalación)": "Normal",
  "Omeprazol 20 mg": "Normal",
  "Metoclopramida 10 mg": "Normal",
  "Ácido acetilsalicílico 100 mg": "Normal"
};

export function getMedicationRisk(medicationName: string): MedicationRisk {
  return medicationRiskDict[medicationName] || "Normal";
}
