"use client";

import { useState } from "react";


export default function PaymentPage() {
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const [storedCards, setStoredCards] = useState([]);
  const [errors, setErrors] = useState({});
  const [showStoredCards, setShowStoredCards] = useState(false);

  // Input validation
  const validateCard = () => {
    const newErrors = {};
    
    // Card number validation (Luhn algorithm)
    if (!cardDetails.number.trim()) {
      newErrors.number = "Card number is required";
    } else if (!isValidCardNumber(cardDetails.number)) {
      newErrors.number = "Invalid card number";
    }
    
    // Expiry validation
    if (!cardDetails.expiry.trim()) {
      newErrors.expiry = "Expiry date is required";
    } else if (!isValidExpiry(cardDetails.expiry)) {
      newErrors.expiry = "Invalid expiry date (MM/YY)";
    } else if (isExpired(cardDetails.expiry)) {
      newErrors.expiry = "Card has expired";
    }
    
    // CVV validation
    if (!cardDetails.cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
    }
    
    // Name validation
    if (!cardDetails.name.trim()) {
      newErrors.name = "Name is required";
    } else if (cardDetails.name.length < 2) {
      newErrors.name = "Name is too short";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // validation functions
  const isValidCardNumber = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanNumber)) return false;
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const isValidExpiry = (expiry) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    
    const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
    return month >= 1 && month <= 12 && year >= 0 && year <= 99;
  };

  const isExpired = (expiry) => {
    const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear) return true;
    if (year === currentYear && month < currentMonth) return true;
    return false;
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  // Mask card number 
  const maskCardNumber = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    const lastFour = cleanNumber.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  // encryption of card details 
  const encryptCardData = (card) => {
    return {
      ...card,
      number: btoa(card.number), // Base64 encoding (not secure for production!)
      cvv: null, // Never store CVV
      maskedNumber: maskCardNumber(card.number),
      lastFour: card.number.replace(/\s/g, '').slice(-4),
      encryptedAt: new Date().toISOString()
    };
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateCard()) {
      alert("Please all details are correct before submitting");
      return;
    }
    
    // Encrypt and store card 
    const encryptedCard = encryptCardData(cardDetails);
    
    setStoredCards([...storedCards, { 
      ...encryptedCard, 
      id: Date.now(),
      // Store only what is needed
      expiry: cardDetails.expiry,
      name: cardDetails.name,
      
    }]);
    
    setCardDetails({ number: "", expiry: "", cvv: "", name: "" });
    setErrors({});
    alert("Card stored securely!");
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Secure Payment Demo</h1>
      

      {/* Payment Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4 text-black">Enter Card Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-black font-semibold">Card Number</label>
            <input
              type="text"
              value={cardDetails.number}
              onChange={(e) =>
                setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value.replace(/\D/g, '')) })
              }
              placeholder="4111 1243 5678 9000"
              className={`w-full border p-2 rounded text-gray-500 font-semibold ${errors.number ? 'border-red-500' : 'border-gray-300'}`} 
            />
            {errors.number && (
              <p className="text-red-500 text-sm mt-1">{errors.number}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/*EXPIRY*/}
            <div>
              <label className="block mb-1 text-black font-semibold">Expiry (MM/YY)</label>
              <input
                type="text"
                value={cardDetails.expiry}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })
                }
                placeholder="12/25"
                className={`w-full border p-2 rounded text-gray-500 font-semibold ${errors.expiry ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.expiry && (
              <p className="text-red-500 text-sm mt-1">errors.expiry</p>
            )}
            </div>
            
            {/*CVV*/}
            <div>
              <label className="block mb-1 text-black font-semibold">CVV</label>
              <input
                type="password"
                value={cardDetails.cvv}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/[^0-9]/g, '').slice(0,3) })
                }
                placeholder="124"
                className={`w-full border p-2 rounded text-gray-500 font-semibold ${
                  errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.cvv && (
                <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                CVV will not be stored after processing
              </p>
            </div>
          </div>

              {/* NAME */}
          <div>
            <label className="block mb-1 text-black font-semibold">Name on Card</label>
            <input
              type="text"
              value={cardDetails.name}
              onChange={(e) =>
                setCardDetails({ ...cardDetails, name: e.target.value })
              }
              placeholder="Derick Lewis"
              className={`w-full border p-2 rounded text-gray-500 font-semibold ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
             {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700"
          >
            Confirm Payment
          </button>
        </form>
      </div>

      {/*Display how the cards are stored*/}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">Stored Cards</h2>
          <button
            onClick={() => setShowStoredCards(!showStoredCards)}
            className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700"
          >
            Show Stored Cards
          </button>
        </div>
            {showStoredCards && (
              <div className="mt-4">
                {storedCards.length === 0 ? (
                  <p className="text-gray-500 text-center py-4"> No Cards Stored Yet</p>
                ) : (
                  <div className="space-y-4"> 
                    {storedCards.map((card, i) => (
                      <div key={card.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start"> 
                          <div>
                            <h3 className="font-bold text-black">Card {i + 1}</h3>
                            <p className="text-gray-700 mt-1">
                            <span className="font-semibold">Number: </span> {card.maskedNumber}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">Name:</span> {card.name}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">CVV: </span>
                              <span className="text-red-600 ml-1">Not Stored</span>
                            </p>
                            </div>
                        </div>
                        </div>
                    ))}
                  </div>
                )}
                </div>
            )}

            {!showStoredCards && storedCards.length > 0 && (
              <div className="text-center py-4"> 
                <p className="text-gray-600">
                  {storedCards.length} Card(s) stored. click button to view
                </p>
              </div>
            )}

      </div>
    </div>


  );
}
