let marketType = 'fx';
let stopLossType = 'pips';

function setMarketType(type) {
    marketType = type;
    document.querySelectorAll('.toggle-btn').forEach((btn, index) => {
        btn.classList.toggle('active', (type === 'fx' && index === 0) || (type === 'crypto' && index === 1));
    });
    
    // Show/hide lot size input based on market type
    const lotSizeGroup = document.getElementById('lotSizeGroup');
    const lotSizeLabel = lotSizeGroup.querySelector('label');
    
    if (type === 'fx') {
        lotSizeGroup.classList.remove('hidden');
        lotSizeLabel.textContent = 'Lot Size (Forex)';
    } else {
        lotSizeGroup.classList.add('hidden');
    }
}

function setStopLossType(type) {
    stopLossType = type;
    document.querySelectorAll('.stop-loss-toggle button').forEach((btn, index) => {
        btn.classList.toggle('active', (type === 'pips' && index === 0) || (type === 'percentage' && index === 1));
    });
    
    document.getElementById('pipsInput').classList.toggle('hidden', type !== 'pips');
    document.getElementById('percentageInput').classList.toggle('hidden', type !== 'percentage');
}

function validateLeverage() {
    const leverageInput = document.getElementById('leverage');
    const leverageError = document.getElementById('leverageError');
    const value = parseInt(leverageInput.value);
    
    if (isNaN(value) || value < 1 || value > 500) {
        leverageInput.classList.add('error');
        leverageError.classList.add('show');
    } else {
        leverageInput.classList.remove('error');
        leverageError.classList.remove('show');
    }
}

function calculatePosition() {
    const accountBalance = parseFloat(document.getElementById('accountBalance').value) || 0;
    const riskPercent = parseFloat(document.getElementById('riskPercent').value) || 0;
    const leverageValue = parseInt(document.getElementById('leverage').value) || 1;
    const entryPrice = parseFloat(document.getElementById('entryPrice').value) || 0;
    
    // Validate leverage
    if (leverageValue < 1 || leverageValue > 500) {
        alert('Please enter a valid leverage value between 1 and 500');
        return;
    }
    
    // Calculate risk amount in dollars
    const riskAmount = accountBalance * (riskPercent / 100);
    
    let positionSize = 0;
    let stopLossPrice = 0;
    let requiredMargin = 0;
    let unitsToTrade = 0;
    
    if (marketType === 'fx') {
        // Forex calculations
        const lotSize = parseFloat(document.getElementById('lotSize').value) || 100000;
        
        let stopLossDistanceInPips = 0;
        
        if (stopLossType === 'pips') {
            stopLossDistanceInPips = parseFloat(document.getElementById('stopLossPips').value) || 0;
        } else {
            const percent = parseFloat(document.getElementById('stopLossPercent').value) || 0;
            stopLossDistanceInPips = (percent / 100) * 10000; // Convert percentage to pips
        }
        
        if (!accountBalance || !riskPercent || !stopLossDistanceInPips || !lotSize) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Forex formula: Position Size = (Account Size × Risk Percentage) / (Stop Loss in Pips × Pip Value)
        // For major pairs, pip value = (0.0001 × lot size)
        const pipValue = 0.0001 * lotSize;
        const maxLots = riskAmount / (stopLossDistanceInPips * pipValue);
        
        unitsToTrade = Math.floor(maxLots * 100) / 100; // Round to 2 decimal places (0.01 lot precision)
        positionSize = unitsToTrade * lotSize;
        requiredMargin = positionSize / leverageValue;
        
        // Calculate stop loss price using entry price and pip distance
        if (entryPrice > 0) {
            // For Forex, 1 pip = 0.0001 for most major pairs
            const pipDistance = stopLossDistanceInPips * 0.0001;
            const stopLossPrice_calc = entryPrice - pipDistance; // Assuming long position
            stopLossPrice = `${stopLossPrice_calc.toFixed(5)} (${stopLossDistanceInPips} pips)`;
        } else {
            stopLossPrice = `${stopLossDistanceInPips} pips`;
        }
        
    } else {
        // Crypto calculations - Entry price ONLY used for stop loss price calculation
        let stopLossDistancePercent = 0;
        
        if (stopLossType === 'pips') {
            const pips = parseFloat(document.getElementById('stopLossPips').value) || 0;
            // For crypto, treat pips as basis points (0.01%)
            stopLossDistancePercent = pips * 0.01;
        } else {
            stopLossDistancePercent = parseFloat(document.getElementById('stopLossPercent').value) || 0;
        }
        
        if (!accountBalance || !riskPercent || !stopLossDistancePercent) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Crypto calculations WITHOUT using entry price for position sizing
        // Position Size = Risk Amount / (Stop Loss Distance as percentage / 100)
        const dollarRiskPerUnit = riskAmount / (stopLossDistancePercent / 100);
        
        // If entry price is available, calculate actual units; otherwise use dollar amount
        if (entryPrice > 0) {
            unitsToTrade = dollarRiskPerUnit / entryPrice;
            positionSize = unitsToTrade * entryPrice;
        } else {
            unitsToTrade = dollarRiskPerUnit; // Fallback to dollar amount
            positionSize = dollarRiskPerUnit;
        }
        
        requiredMargin = positionSize / leverageValue;
        
        // Calculate stop loss price ONLY for display purposes
        if (entryPrice > 0) {
            const stopLossPrice_calc = entryPrice * (1 - stopLossDistancePercent / 100);
            stopLossPrice = stopLossPrice_calc.toFixed(5);
        } else {
            stopLossPrice = `${stopLossDistancePercent}% below entry`;
        }
    }
    
    // Display results
    if (marketType === 'fx') {
        document.getElementById('positionSize').textContent = `${positionSize.toFixed(0)} units`;
    } else {
        document.getElementById('positionSize').textContent = `$${positionSize.toFixed(2)}`;
    }
    
    document.getElementById('riskAmount').textContent = `$${riskAmount.toFixed(2)}`;
    document.getElementById('stopLossPrice').textContent = stopLossPrice;
    document.getElementById('requiredMargin').textContent = `$${requiredMargin.toFixed(2)}`;
    
    if (marketType === 'fx') {
        document.getElementById('unitsToTrade').textContent = `${unitsToTrade.toFixed(2)} lots`;
    } else {
        if (entryPrice > 0) {
            document.getElementById('unitsToTrade').textContent = `${unitsToTrade.toFixed(8)} units`;
        } else {
            document.getElementById('unitsToTrade').textContent = `${unitsToTrade.toFixed(2)} (need entry price for units)`;
        }
    }
    
    document.getElementById('results').classList.remove('hidden');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set default values for demonstration
    document.getElementById('accountBalance').value = '10000';
    document.getElementById('riskPercent').value = '2';
    document.getElementById('entryPrice').value = '1.2345';
    document.getElementById('stopLossPips').value = '20';
    document.getElementById('lotSize').value = '100000';
    
    // Initialize with Forex selected
    setMarketType('fx');
    
    // Add event listeners for market type buttons
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            if (index === 0) {
                setMarketType('fx');
            } else {
                setMarketType('crypto');
            }
        });
    });
    
    // Add event listeners for stop loss type buttons
    const stopLossButtons = document.querySelectorAll('.stop-loss-toggle button');
    stopLossButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            if (index === 0) {
                setStopLossType('pips');
            } else {
                setStopLossType('percentage');
            }
        });
    });
    
    // Add event listener for calculate button
    const calculateBtn = document.querySelector('.calculate-btn');
    calculateBtn.addEventListener('click', calculatePosition);
    
    // Add event listener for leverage validation
    const leverageInput = document.getElementById('leverage');
    leverageInput.addEventListener('input', validateLeverage);
});