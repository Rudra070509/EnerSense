/**
 * EnerSense Mumbai / MERC Revised Tariff & Predictive Billing Engine
 * FY 2024-25 (Effective 1 April 2024 - Case No. 231 of 2022)
 * 
 * Category: LT -I (B) Residential
 * 
 * 1. Tiered Energy Charges (EC):
 *    - 0 to 100 units   : ₹3.15 / kWh
 *    - 101 to 300 units : ₹5.40 / kWh
 *    - 301 to 500 units : ₹7.10 / kWh
 *    - 501+ units       : ₹8.15 / kWh
 * 
 * 2. Wheeling Charges (WC):
 *    - Flat ₹2.60 / kWh on all units
 * 
 * 3. Monthly Fixed / Demand Charges:
 *    - 0 to 100 units   : ₹90 / month
 *    - 101 to 300 units : ₹135 / month
 *    - 301 to 500 units : ₹135 / month
 *    - 501+ units       : ₹160 / month
 * 
 * 4. Time-Of-Day (TOD) Tariffs:
 *    - 22:00 to 06:00 (Night Off-Peak) : -₹0.75 / kWh (Discount)
 *    - 06:00 to 09:00 (Normal Morning)  :  ₹0.00 / kWh
 *    - 09:00 to 12:00 (Morning Peak)    : +₹0.50 / kWh (Surcharge)
 *    - 12:00 to 18:00 (Normal Day)      :  ₹0.00 / kWh
 *    - 18:00 to 22:00 (Evening Peak)    : +₹1.00 / kWh (Surcharge)
 * 
 * 5. Statutory Duties & Levies:
 *    - Maharashtra Electricity Duty : ~16% on (Energy + Wheeling + Fixed charges)
 *    - Fuel Adjustment Cost (FAC)   : ~₹0.35 / kWh
 */

export const RESIDENTIAL_SLABS = [
  { min: 0, max: 100, energyRate: 3.15, fixedCharge: 90 },
  { min: 100, max: 300, energyRate: 5.40, fixedCharge: 135 },
  { min: 300, max: 500, energyRate: 7.10, fixedCharge: 135 },
  { min: 500, max: Infinity, energyRate: 8.15, fixedCharge: 160 }
];

export const WHEELING_CHARGE_PER_KWH = 2.60; // ₹ / kWh flat
export const FAC_PER_KWH = 0.35;             // Fuel Adjustment Cost ~₹0.35/kWh
export const MAHARASHTRA_TAX_DUTY_PCT = 0.16; // 16% State Electricity Duty

/**
 * Returns current Time-of-Day (TOD) slot and tariff incentive/penalty
 */
export function getCurrentTodTariff(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 22 || hour < 6) {
    return {
      slot: 'Night Off-Peak (22:00 - 06:00)',
      adjustment: -0.75,
      type: 'discount',
      badge: '🌙 Night Saver (-₹0.75/unit)',
      tip: 'Optimal time for heavy loads & EV charging!'
    };
  } else if (hour >= 18 && hour < 22) {
    return {
      slot: 'Evening Peak (18:00 - 22:00)',
      adjustment: 1.00,
      type: 'peak',
      badge: '⚡ Peak Hours (+₹1.00/unit)',
      tip: 'High demand period: minimize AC & heavy appliances to reduce bill!'
    };
  } else if (hour >= 9 && hour < 12) {
    return {
      slot: 'Morning Peak (09:00 - 12:00)',
      adjustment: 0.50,
      type: 'peak',
      badge: '⚠️ Morning Peak (+₹0.50/unit)',
      tip: 'Moderate peak period.'
    };
  } else {
    return {
      slot: 'Normal Hours',
      adjustment: 0.00,
      type: 'normal',
      badge: '☀️ Normal Rate',
      tip: 'Standard tariff applies.'
    };
  }
}

/**
 * Computes progressive base energy charge for given total kWh
 */
export function calculateProgressiveEnergyCharge(totalKwh) {
  let remaining = Math.max(0, totalKwh);
  let totalCost = 0;

  for (const slab of RESIDENTIAL_SLABS) {
    if (remaining <= 0) break;
    const slabCapacity = slab.max - slab.min;
    const unitsInSlab = Math.min(remaining, slabCapacity);
    totalCost += unitsInSlab * slab.energyRate;
    remaining -= unitsInSlab;
  }

  return totalCost;
}

/**
 * Computes tiered fixed demand charge based on consumption tier
 */
export function getFixedChargeForConsumption(monthlyKwh) {
  if (monthlyKwh <= 100) return 90;
  if (monthlyKwh <= 500) return 135;
  return 160;
}

/**
 * Computes estimated cost for today based on live PZEM readings
 * Includes progressive rate + wheeling + current TOD slot + duty
 */
export function calculateTodayCost(liveEnergyKwh) {
  const kwh = parseFloat(liveEnergyKwh) || 0;
  if (kwh <= 0) return 0;

  // Base tier 1 rate for daily incremental consumption: ₹3.15 + ₹2.60 wheeling
  const tod = getCurrentTodTariff();
  const effectivePerUnit = 3.15 + WHEELING_CHARGE_PER_KWH + tod.adjustment + FAC_PER_KWH;
  const baseCost = kwh * effectivePerUnit;
  const duty = baseCost * MAHARASHTRA_TAX_DUTY_PCT;
  
  return baseCost + duty;
}

/**
 * Precise Predictive Monthly Bill Algorithm using MERC FY 2024-25 Model
 * 
 * @param {number} liveEnergyKwh - Total accumulated kWh from sensor
 * @param {number} currentWatts - Current instantaneous load draw in Watts
 * @returns {Object} Full breakdown of predicted electricity bill
 */
export function calculateMonthlyPrediction(liveEnergyKwh, currentWatts = 0) {
  const kwhToday = parseFloat(liveEnergyKwh) || 0;
  const watts = parseFloat(currentWatts) || 0;

  // Instantaneous run rate (24h continuous draw)
  const runRateDailyKwh = (watts * 24) / 1000;

  // Blended baseline: if test just started (low accumulated kWh),
  // use run-rate projection. If running steadily, use daily accumulated trend.
  let estimatedDailyKwh = kwhToday > 0.1 ? kwhToday : Math.max(kwhToday * 2, runRateDailyKwh);

  if (estimatedDailyKwh <= 0.01 && watts > 0) {
    estimatedDailyKwh = runRateDailyKwh;
  } else if (estimatedDailyKwh <= 0.01) {
    // Default Mumbai 2BHK residential baseline (~120 units/month -> 4.0 kWh/day)
    estimatedDailyKwh = 4.0;
  }

  // 30-Day Monthly Units Forecast
  const projectedMonthlyKwh = estimatedDailyKwh * 30;

  // 1. Progressive Energy Charge (EC)
  const energyCharges = calculateProgressiveEnergyCharge(projectedMonthlyKwh);

  // 2. Wheeling Charges (WC) @ ₹2.60/kWh flat
  const wheelingCharges = projectedMonthlyKwh * WHEELING_CHARGE_PER_KWH;

  // 3. Fixed Demand Charge (FC) based on slab
  const fixedCharges = getFixedChargeForConsumption(projectedMonthlyKwh);

  // 4. Fuel Adjustment Cost (FAC)
  const facCharges = projectedMonthlyKwh * FAC_PER_KWH;

  // 5. State Electricity Duty (16% on EC + WC + FC)
  const taxableBase = energyCharges + wheelingCharges + fixedCharges;
  const electricityDuty = taxableBase * MAHARASHTRA_TAX_DUTY_PCT;

  // 6. Total Forecasted Bill
  const totalPredictedBill = energyCharges + wheelingCharges + fixedCharges + facCharges + electricityDuty;

  // Slab tier determination
  let slabTier = '0-100 units (₹3.15 + ₹2.60/u)';
  let tierNumber = 1;
  if (projectedMonthlyKwh > 500) {
    slabTier = '501+ units (₹8.15 + ₹2.60/u)';
    tierNumber = 4;
  } else if (projectedMonthlyKwh > 300) {
    slabTier = '301-500 units (₹7.10 + ₹2.60/u)';
    tierNumber = 3;
  } else if (projectedMonthlyKwh > 100) {
    slabTier = '101-300 units (₹5.40 + ₹2.60/u)';
    tierNumber = 2;
  }

  const tod = getCurrentTodTariff();

  return {
    projectedMonthlyKwh: projectedMonthlyKwh.toFixed(1),
    estimatedDailyKwh: estimatedDailyKwh.toFixed(2),
    energyCharges: Math.round(energyCharges),
    wheelingCharges: Math.round(wheelingCharges),
    fixedCharges: Math.round(fixedCharges),
    facCharges: Math.round(facCharges),
    electricityDuty: Math.round(electricityDuty),
    predictedBill: Math.round(totalPredictedBill),
    slabTier,
    tierNumber,
    tod,
    effectiveUnitRate: (totalPredictedBill / projectedMonthlyKwh).toFixed(2)
  };
}
