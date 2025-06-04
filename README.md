# FX & Crypto Position Calculator

A professional trading position calculator for Forex and Cryptocurrency markets. This tool helps traders calculate optimal position sizes based on risk management principles.

## Features

- **Dual Market Support**: Works for both Forex and Cryptocurrency trading
- **Risk Management**: Calculate position sizes based on account balance and risk percentage
- **Multiple Stop Loss Types**: Support for both pip-based and percentage-based stop losses
- **Leverage Support**: Configurable leverage from 1x to 500x
- **Professional UI**: Clean, modern interface with responsive design
- **Real-time Calculations**: Instant results as you input your parameters

## How to Use

1. Select your market type (Forex or Crypto)
2. Enter your account balance
3. Set your risk percentage (recommended: 1-3%)
4. Enter the entry price (optional for crypto)
5. For Forex: Enter lot size (standard is 100,000)
6. Set your stop loss distance (in pips or percentage)
7. Optionally set leverage
8. Click "Calculate Position"

## Calculations

### Forex
- Position Size = (Account Balance × Risk %) / (Stop Loss Pips × Pip Value)
- Pip Value = 0.0001 × Lot Size (for major pairs)
- Required Margin = Position Size / Leverage

### Crypto
- Position Size = Risk Amount / (Stop Loss Distance %)
- Units to Trade = Position Size / Entry Price
- Required Margin = Position Size / Leverage

## GitHub Pages Deployment

1. Upload all files to your GitHub repository
2. Go to repository Settings > Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Your calculator will be available at `https://yourusername.github.io/yourrepository`

## File Structure

```
├── index.html      # Main HTML structure
├── styles.css      # All styling and layout
├── script.js       # JavaScript functionality
└── README.md       # This documentation
```

## Customization

- **Logo**: Replace the base64 image in `index.html` with your own logo
- **Colors**: Modify the color scheme in `styles.css`
- **Branding**: Update the header text and title as needed

## Browser Support

This calculator works in all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## License

This project is open source and available under the MIT License.