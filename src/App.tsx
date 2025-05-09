import React, { useState, useEffect } from 'react';
import './App.css';
import ProductList from './screens/ProductList';
import { cartService } from './services/CartService';

// App component follows Single Responsibility Principle - managing app layout and structure
function App() {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = async () => {
    const count = await cartService.getCartCount();
    setCartCount(count);
  };

  // Initialize cart count on first load
  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <div className="App min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 mb-5">
        <div className="max-w-[320px] mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Shopin</h1>
          <div className="relative">
            <button
              className="p-2 focus:outline-none"
              aria-label="Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main>
        <ProductList onCartUpdate={updateCartCount} />
      </main>
    </div>
  );
}

export default App;
