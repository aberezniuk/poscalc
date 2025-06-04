/* FX & Crypto Position Calculator - JavaScript Module */

let marketType = 'fx';
let stopLossType = 'pips';

export function initCalculator() {
  // Market type toggles
  document.querySelectorAll('.toggle-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => setMarketType(index === 0 ? 'fx' : 'crypto')); 
  });

  // Stop-loss toggles
  document.querySelectorAll('.stop-loss-toggle button').forEach((btn, index) => {
    btn.addEventListener('click', () => setStopLossType(index === 0 ? 'pips' : 'percentage'));
  });

  // Leverage validation
  const leverageInput = document.getElementById('leverage');
  leverageInput.addEventListener('input', validateLeverage);

  // Calculate button
  document.querySelector('.calculate-btn').addEventListener('click', calculatePosition);

  // Set default demo values
  document.getElementById('accountBalance').value = '10000';
  document.getElementById('riskPercent').value = '2';
  document.getElementById('entryPrice').value = '1.2345';
  document.getElementById('stopLossPips').value = '20';
  document.getElementById('lotSize').value = '100000';

  // Initialize UI
  setMarketType('fx');
  setStopLossType('pips');
}

function setMarketType(type) {
  marketType = type;
  const toggles = document.querySelectorAll('.toggle-btn');
  toggles.forEach((btn, idx) => {
    btn.classList.toggle('active', (type === 'fx' && idx === 0) || (type === 'crypto' && idx === 1));
  });

  const lotGroup = document.getElementById('lotSizeGroup');
  lotGroup.classList.toggle('hidden', type !== 'fx');
}

function setStopLossType(type) {
  stopLossType = type;
  const buttons = document.querySelectorAll('.stop-loss-toggle button');
  buttons.forEach((btn, idx) => {
    btn.classList.toggle('active', (type === 'pips' && idx === 0) || (type === 'percentage' && idx === 1));
  });

  document.getElementById('pipsInput').classList.toggle('hidden', type !== 'pips');
  document.getElementById('percentageInput').classList.toggle('hidden', type !== 'percentage');
}

function validateLeverage() {
  const input = document.getElementById('leverage');
  const error = document.getElementById('leverageError');
  const val = parseInt(input.value, 10);

  if (isNaN(val) || val < 1 || val > 500) {
    input.classList.add('error');
    error.classList.add('show');
  } else {
    input.classList.remove('error');
    error.classList.remove('show');
  }
}

function calculatePosition() {
  const accountBalance = parseFloat(document.getElementById('accountBalance').value) || 0;
  const riskPercent = parseFloat(document.getElementById('riskPercent').value) || 0;
  const leverageValue = parseInt(document.getElementById('leverage').value) || 1;
  const entryPrice = parseFloat(document.getElementById('entryPrice').value) || 0;

  if (leverageValue < 1 || leverageValue > 500) {
    alert('Please enter a valid leverage value between 1 and 500');
    return;
  }

  const riskAmount = accountBalance * (riskPercent / 100);
  let positionSize = 0, stopLossPrice = 0, requiredMargin = 0, unitsToTrade = 0;

  if (marketType === 'fx') {
    const lotSize = parseFloat(document.getElementById('lotSize').value) || 100000;
    let pipsDistance = stopLossType === 'pips'
      ? parseFloat(document.getElementById('stopLossPips').value) || 0
      : (parseFloat(document.getElementById('stopLossPercent').value) || 0) * 100;

    if (!accountBalance || !riskPercent || !pipsDistance || !lotSize) {
      alert('Please fill in all required fields');
      return;
    }

    const pipValue = 0.0001 * lotSize;
    const maxLots = riskAmount / (pipsDistance * pipValue);
    unitsToTrade = Math.floor(maxLots * 100) / 100;
    positionSize = unitsToTrade * lotSize;
    requiredMargin = positionSize / leverageValue;

    if (entryPrice > 0) {
      const pipDist = pipsDistance * 0.0001;
      const sl = (entryPrice - pipDist).toFixed(5);
      stopLossPrice = `${sl} (${pipsDistance} pips)`;
    } else {
      stopLossPrice = `${pipsDistance} pips`;
    }
  } else {
    let pctDist = stopLossType === 'pips'
      ? (parseFloat(document.getElementById('stopLossPips').value) || 0) * 0.01
      : parseFloat(document.getElementById('stopLossPercent').value) || 0;

    if (!accountBalance || !riskPercent || !pctDist) {
      alert('Please fill in all required fields');
      return;
    }

    const dollarRiskPerUnit = riskAmount / (pctDist / 100);
    if (entryPrice > 0) {
      unitsToTrade = dollarRiskPerUnit / entryPrice;
      positionSize = unitsToTrade * entryPrice;
    } else {
      unitsToTrade = dollarRiskPerUnit;
      positionSize = dollarRiskPerUnit;
    }
    requiredMargin = positionSize / leverageValue;

    if (entryPrice > 0) {
      stopLossPrice = (entryPrice * (1 - pctDist / 100)).toFixed(5);
    } else {
      stopLossPrice = `${pctDist}% below entry`;
    }
  }

  displayResults(positionSize, riskAmount, stopLossPrice, requiredMargin, unitsToTrade, entryPrice);
}

function displayResults(posSize, riskAmt, slPrice, margin, units, entryPrice) {
  const rs = document.getElementById('results');
  document.getElementById('positionSize').textContent = 
    marketType === 'fx' ? `${posSize.toFixed(0)} units` : `$${posSize.toFixed(2)}`;
  document.getElementById('riskAmount').textContent = `$${riskAmt.toFixed(2)}`;
  document.getElementById('stopLossPrice').textContent = slPrice;
  document.getElementById('requiredMargin').textContent = `$${margin.toFixed(2)}`;

  const unitsTxt = marketType === 'fx'
    ? `${units.toFixed(2)} lots`
    : entryPrice > 0
      ? `${units.toFixed(8)} units`
      : `${units.toFixed(2)} (need entry price for units)`;

  document.getElementById('unitsToTrade').textContent = unitsTxt;
  rs.classList.remove('hidden');
}

// Auto-init when script is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initCalculator);
}