export const APP_CONFIG = {
  venueName: "CueClub",
  tagline: "Billiards, Snooker Lounge & Cafe",
  currency: "INR",
  currencySymbol: "₹",
  timezone: "Asia/Kolkata",
  defaultTaxPercent: 5.0, // 5% GST
  openingMinute: 11 * 60, // 11:00 AM (660 min)
  closingMinute: 24 * 60, // 12:00 AM Midnight (1440 min)
  defaultSlotLengthMinutes: 60,
  defaultDepositPercent: 20, // 20% deposit for online booking
  minChargeMinutes: 15,
  graceMinutes: 5,
  pollingIntervalMs: 5000,
  kitchenPollingIntervalMs: 3000,
  loyaltyPointsPer100Spent: 1, // 1 point per Rs 100
  loyaltyRupeesPerPoint: 1, // Rs 1 per point
} as const;

export default APP_CONFIG;
