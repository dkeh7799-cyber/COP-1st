
export type ProductType = '터보' | '스크류' | 'ISC' | '직화식' | '중온수' | '스팀';
export type MeasuredFlag = 'O' | 'X';
export type CorrectionRef = '냉각수 출구' | '냉각수 입구';

export interface AppState {
  general: {
    siteName: string;
    diagnosisDate: string;
    productType: ProductType;
    manufacturer: string;
    manufacturingYear: string;
  };
  spec: {
    coolingCapacity: number; // D9
    coolingInput: number;    // D10
    coldWaterFlow: number;   // D12
    heatingCapacity: number; // D13
    heatingInput: number;    // D14
    heatingWaterFlow: number; // 온수 유량 추가
    coolingWaterFlow: number; // D17
  };
  measurement: {
    coldWaterFlowMeasured: MeasuredFlag; // D19
    inputHeatMeasured: MeasuredFlag;     // D20
    evapFlow: number;   // D21
    evapInlet: number;  // D22
    evapOutlet: number; // D23
    fuelConsumption: number; // D25
    condenserFlow: number;   // D27
    condenserInlet: number;  // D28
    condenserOutlet: number; // D29
  };
  config: {
    targetColdOutlet: number;    // D33 (보정기준 냉수출구)
    targetCoolingRefTemp: number; // D34 (보정기준 냉각수 입/출구)
    correctionRef: CorrectionRef; // C34
  };
}
