"use client";

import React, { useState } from "react";
import { Calculator, Sparkles, Building2, CheckCircle2 } from "lucide-react";
import { formatNpr } from "@/lib/money";

export const SalonCalculatorWidget: React.FC = () => {
  const [chairsCount, setChairsCount] = useState<number>(3);
  const [dailyClients, setDailyClients] = useState<number>(6);
  const [avgPrice, setAvgPrice] = useState<number>(500);

  // Daily Revenue = chairs * clients * avgPrice
  const dailyRevenueNpr = chairsCount * dailyClients * avgPrice;
  const monthlyRevenueNpr = dailyRevenueNpr * 26; // 26 working days in Nepal month

  // Total Fit-Out Investment Estimate = chairs * NPR 195,150
  const chairCostNpr = 195150;
  const totalInvestmentNpr = chairsCount * chairCostNpr;

  // Payback Days = totalInvestment / dailyRevenue
  const paybackDays = Math.ceil(totalInvestmentNpr / dailyRevenueNpr);
  const paybackMonths = (paybackDays / 30).toFixed(1);

  return (
    <div className="rounded-3xl bg-inverse-surface text-inverse-on-surface p-6 sm:p-10 border border-neutral-800 shadow-elevated space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-gold font-bold text-xs uppercase tracking-widest">
            <Calculator className="w-4 h-4" />
            <span>Interactive B2B ROI Calculator</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Calculate Salon Equipment Payback Period
          </h3>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-gold/15 text-gold border border-gold/40 text-xs font-bold flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Salon Revenue Predictor
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Sliders Control Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slider 1: Chairs Count */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-neutral-400">Number of Ikonic Hydraulic Chairs:</span>
              <span className="text-gold font-bold font-mono text-sm">{chairsCount} Chairs</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={chairsCount}
              onChange={(e) => setChairsCount(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-gold"
            />
          </div>

          {/* Slider 2: Daily Clients Per Chair */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-neutral-400">Daily Haircuts / Services per Chair:</span>
              <span className="text-gold font-bold font-mono text-sm">{dailyClients} Clients / Day</span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              step={1}
              value={dailyClients}
              onChange={(e) => setDailyClients(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-gold"
            />
          </div>

          {/* Slider 3: Average Service Charge */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-neutral-400">Average Charge per Client (NPR):</span>
              <span className="text-gold font-bold font-mono text-sm">NPR {avgPrice}</span>
            </div>
            <input
              type="range"
              min={300}
              max={2000}
              step={50}
              value={avgPrice}
              onChange={(e) => setAvgPrice(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-gold"
            />
          </div>
        </div>

        {/* Live Calculation Output Card */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Estimated Monthly Revenue</span>
            <div className="text-3xl font-bold font-sans text-white mt-1">
              {formatNpr(monthlyRevenueNpr * 100)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gold/10 border border-gold/40 space-y-1">
            <span className="text-[10px] font-mono text-gold uppercase tracking-wider block">Full Investment Payback Time</span>
            <div className="text-2xl font-bold text-gold font-mono">
              {paybackDays} Days (~{paybackMonths} Months)
            </div>
            <p className="text-[11px] text-neutral-300">
              Your {chairsCount}-chair fit-out pays for itself completely in {paybackMonths} months.
            </p>
          </div>

          <div className="text-xs text-neutral-400 space-y-2 pt-1">
            <div className="flex items-center text-white font-semibold">
              <CheckCircle2 className="w-4 h-4 text-gold mr-1.5" /> 15% Gold Wholesale Tier Discount Available
            </div>
            <a
              href="https://wa.me/9779868089892?text=Hi%20Eternity%20Products!%20I%20used%20the%20Salon%20ROI%20Calculator%20and%20want%20to%20request%20a%20B2B%20quote."
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs text-center transition-colors block shadow-gold"
            >
              Request Custom Salon Fit-Out Quote
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
