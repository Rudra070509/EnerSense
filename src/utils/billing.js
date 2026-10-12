/**
 * EnerSense Indian Electricity Tariff & Bill Prediction Engine
 * 
 * Standard Tiered Slab Model (Typical State Discom/Residential tariff):
 * Slab 1: 0 - 100 kWh   -> ₹3.50 / kWh
 * Slab 2: 101 - 300 kWh -> ₹5.80 / kWh
 * Slab 3: 301 - 500 kWh -> ₹7.50 / kWh
 * Slab 4: > 500 kWh     -> ₹9.20 / kWh
 * Fixed meter charge: ₹85 / month
 * Electricity Duty / Tax: ~9%
 */

export const TARIFF_SLABS = [
  { min: 0, max: 100, rate: 3.50 },
  { min: 100, max: 300, rate: 5.80 },
  { min: 300, max: 500, rate: 7.50 },
  { min: 500, max: Infinity, rate: 9.20 }
];

export const FIXED_MONTHLY_CHARGE = 85.00; // ₹
export const ELECTRICITY_DUTY_PCT = 0.09;  // 9%

/**
 * Calculates electricity charges using the progressive slab model
 * @param {number} totalKwh - Total consumed energy in kWh
 * @returns {number} Cost in Rupees (excluding tax & fixed charge)
 */
export function calculateEnergyCharge(totalKwh) {
  let remaining = Math.max(0, totalKwh);
  let totalCost = 0;

  for (const slab of TARIFF_SLABS) {
    if (remaining <= 0) break;
    const slabCapacity = slab.max - slab.min;
    const unitsInSlab = Math.min(remaining, slabCapacity);
    totalCost += unitsInSlab * slab.rate;
    remaining -= unitsInSlab;
  }

  return totalCost;
}

/**
 * Computes today's estimated cost based on live hardware consumption today
 * @param {number} liveEnergyKwh 
 * @returns {number}
 */
export function calculateTodayCost(liveEnergyKwh) {
  const kwh = parseFloat(liveEnergyKwh) || 0;
  // Average blended rate for daily estimate (~₹5.50/kWh + daily fraction of fixed charges)
  const energyCharge = kwh * 5.80;
  const duty = energyCharge * ELECTRICITY_DUTY_PCT;
  return energyCharge + duty;
}

/**
 * Predictive Billing Algorithm:
 * Uses current live run-rate (Watts) and accumulated daily kWh to project 
 * the 30-day monthly consumption and bill with progressive tariff calculation.
 * 
 * @param {number} liveEnergyKwh - Current accumulated kWh today
 * @param {number} currentWatts - Current instantaneous load draw in Watts
 * @returns {Object} Forecast details
 */
export function calculateMonthlyPrediction(liveEnergyKwh, currentWatts = 0) {
  const kwhToday = parseFloat(liveEnergyKwh) || 0;
  const watts = parseFloat(currentWatts) || 0;

  // Run rate: Current draw running 24h translates to kWh/day
  const runRateDailyKwh = (watts * 24) / 1000;

  // Blended baseline: If kwhToday is small (< 0.5 kWh e.g. early morning or new test),
  // supplement with run rate projection so forecast is realistic and responsive
  let estimatedDailyKwh = kwhToday > 0.3 ? kwhToday : Math.max(kwhToday * 2, runRateDailyKwh);
  
  // Floor at minimal household baseline if both are near 0
  if (estimatedDailyKwh <= 0.01 && watts > 0) {
    estimatedDailyKwh = runRateDailyKwh;
  } else if (estimatedDailyKwh <= 0.01) {
    estimatedDailyKwh = 3.5; // Baseline average 3.5 kWh/day (~105 kWh/month)
  }

  // 30-Day Monthly Energy Forecast
  const projectedMonthlyKwh = estimatedDailyKwh * 30;

  // Progressive slab tariff energy charge
  const baseEnergyCost = calculateEnergyCharge(projectedMonthlyKwh);
  const dutyCharge = baseEnergyCost * ELECTRICITY_DUTY_PCT;
  const totalPredictedBill = baseEnergyCost + dutyCharge + FIXED_MONTHLY_CHARGE;

  return {
    projectedMonthlyKwh: projectedMonthlyKwh.toFixed(1),
    estimatedDailyKwh: estimatedDailyKwh.toFixed(2),
    baseEnergyCost: Math.round(baseEnergyCost),
    dutyCharge: Math.round(dutyCharge),
    fixedCharge: FIXED_MONTHLY_CHARGE,
    predictedBill: Math.round(totalPredictedBill),
    slabTier: projectedMonthlyKwh <= 100 ? 1 : projectedMonthlyKwh <= 300 ? 2 : projectedMonthlyKwh <= 500 ? 3 : 4
  };
}
