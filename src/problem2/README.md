# Currency Swap Form

A modern web application for swapping cryptocurrency tokens built with Vite, React, and TypeScript. The application allows users to swap between different cryptocurrency tokens with a beautiful interface and excellent user experience.

## 🚀 Features

- 🎨 **Modern UI/UX**: Beautiful interface with smooth animations and dark theme
- 🔄 **Token Swapping**: Easily swap between different cryptocurrency tokens with a single click
- 💰 **Real-time Token Prices**: Integrated CoinGecko API to fetch up-to-date token prices
- ✅ **Full Validation**: Input validation, balance checks, and swap condition validation
- 🖼️ **Token Icons**: Display token icons from Switcheo token-icons repository
- 📱 **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- ⚡ **Performance**: Built with Vite for fast build times and dev server
- 🎉 **Success Modal**: Beautiful success popup with smooth animations

## 🛠️ Tech Stack

- **Vite 5.0** - Lightning-fast build tool and dev server
- **React 18.2** - UI framework with modern hooks
- **TypeScript 5.2** - Type safety and better developer experience
- **CSS3** - Styling with custom properties, animations, and responsive design

## 📁 Project Structure

```
Crypto/
├── public/                 # Static assets (if any)
├── src/
│   ├── components/         # React components
│   │   ├── CurrencySwapForm.tsx      # Main swap form component
│   │   ├── CurrencySwapForm.css      # Styles for swap form
│   │   ├── TokenSelector.tsx         # Token selection dropdown component
│   │   ├── TokenSelector.css         # Styles for token selector
│   │   ├── SwapButton.tsx            # Button to swap between tokens
│   │   ├── SwapButton.css            # Styles for swap button
│   │   ├── SuccessModal.tsx          # Success notification modal
│   │   └── SuccessModal.css          # Styles for success modal
│   ├── utils/              # Utility functions
│   │   └── api.ts          # API calls for token prices and icons
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles and CSS variables
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tsconfig.node.json      # TypeScript config for Node.js
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 📦 Installation

### Prerequisites

- Node.js >= 16.x
- npm >= 7.x or yarn >= 1.22.x

### Installation Steps

1. **Clone the repository or download the source code**

```bash
# If you have a git repository
git clone <repository-url>
cd Crypto

# Or extract the zip file and navigate to the directory
```

2. **Install dependencies**

```bash
npm install
```

This will install all required dependencies:
- `react` and `react-dom`
- `vite` and related plugins
- `typescript` and type definitions

## 🚀 Running the Project

### Development Mode

Run the application in development mode with hot module replacement:

```bash
npm run dev
```

The application will run at `http://localhost:5173` (or another port if 5173 is already in use).

Vite will automatically open your browser. You can see changes instantly without refreshing the page.

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The output will be generated in the `dist/` folder with minified and optimized files.

### Preview Production Build

Preview the production build before deploying:

```bash
npm run preview
```

## 📖 Usage Guide

1. **Select Source Token (From Token)**
   - Click on the token icon on the right side of the "From" input
   - Default is Bitcoin (BTC)
   - Select a token from the dropdown list

2. **Enter Amount**
   - Enter the amount of tokens you want to swap in the "From" input field
   - Only numbers and decimal points are allowed
   - The destination token amount will be automatically calculated

3. **Select Destination Token (To Token)**
   - Click on the token icon on the right side of the "To" input
   - Default is USDT
   - Select a token from the dropdown list

4. **Swap Tokens**
   - Click the "Swap" button in the middle to swap the positions of the two tokens
   - Or select different tokens from the dropdown

5. **Confirm Swap**
   - Click the "Swap" button at the bottom of the form
   - If successful, a modal will appear showing the transaction details

## 🔌 APIs Used

### Token Prices

The application uses CoinGecko API as the primary source with a fallback to the original API:

- **Primary**: `https://api.coingecko.com/api/v3/simple/price`
- **Fallback**: `https://interview.switcheo.com/prices.json`

### Token Icons

Icons are fetched from Switcheo token-icons repository:

```
https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{SYMBOL}.svg
```

Example: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/BTC.svg`

## 🎨 Main Components

### CurrencySwapForm

The main component that manages the entire swap form logic:
- Manages form state (tokens, amounts)
- Input validation
- Exchange rate calculation
- Form submission handling

### TokenSelector

Dropdown component for token selection:
- Displays token icon
- Search functionality
- Responsive dropdown with dynamic height
- Z-index management to prevent overlap

### SwapButton

Button to swap positions between two tokens with rotation animation.

### SuccessModal

Success notification modal with:
- Animated checkmark
- Particle effects
- Swap details display
- Smooth animations

## 🎯 Technical Features

- **Type Safety**: Full TypeScript support for type checking
- **Responsive Design**: Media queries for mobile, tablet, and desktop
- **Animations**: CSS keyframes and transitions for smooth UX
- **Error Handling**: Comprehensive validation and clear error messages
- **API Fallback**: Automatic fallback when primary API fails
- **Performance**: Code splitting and lazy loading with Vite

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically select another port. Check the terminal to see the new port.

### API Not Working

If token prices are not loading:
- Check your internet connection
- Check the console for API errors
- The application will fallback to the backup API

### Build Errors

If you encounter build errors:

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Available Scripts

- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📄 License

This project is created for educational and demonstration purposes.

## 👨‍💻 Author

Developed with ❤️ using Vite + React + TypeScript

---

**Note**: This is a demo application and does not perform real swaps. All transactions are simulated.
