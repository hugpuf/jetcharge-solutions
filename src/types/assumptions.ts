export interface AssumptionData {
  siteDistances: {
    carDealership: number;
    publicStation: number;
    officeBuilding: number;
    apartment: number;
    house: number;
  };
  cableCosts: {
    ac: number;
    dc: number;
  };
  carrierCosts: {
    tray: number;
    trench: number;
  };
  chargerPrices: {
    ac: number;
    dc: number;
  };
  labourMarkup: number;
}

export const defaultAssumptions: AssumptionData = {
  siteDistances: {
    carDealership: 50,
    publicStation: 40,
    officeBuilding: 40,
    apartment: 20,
    house: 20,
  },
  cableCosts: { ac: 50, dc: 150 },
  carrierCosts: { tray: 50, trench: 1000 },
  chargerPrices: { ac: 2000, dc: 25000 },
  labourMarkup: 42.15,
};