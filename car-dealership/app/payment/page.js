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

//Input validation
const validateCard = () => {
  const newErrors = {};

  //card number validation will use luhn algorithm
  if(!cardDetails.number.trim())
  {
    newErrors.number = "Card number is required";
  } else if(!isValidCardNumber(cardDetails.number)) {
    newErrors.number = "invalid card number";
  }

  //expiry validation
  if(!cardDetails.expiry.trim()){
    newErrors.expiry = "Expiry Date is required"
  } else if(!validateExpiry(cardDetails.expiry)){
    newErrors.expiry = 'invalid expiry format (MM/YY)'
  } else if(isExpired(cardDetails.expiry)){
    newErrors.expiry = "Card has expired"
  }

  //cvv validation
  if(!cardDetails.cvv.trim()){
    newErrors.cvv = "cvv is required"
  } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
    newErrors.cvv = 'cvv must be 3 or 4 digits';
  }

  //name validation
  if(!cardDetails.name.trim()){
    newErrors.name = "name is required"
  } else if (cardDetails.name < 2){
    newErrors.name = 'Name must be 2 characters or more'
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}

//validation function
const isValidCardNumber = (number) => {
  const cleanNumber = number.replace(/\s/g, '');
  if(!/^\d{13,19}$/.test(cleanNumber)) return false;

  //luhn algorithm
  let sum =0;
  let isEven = false;

  for(let i = cleanNumber.length - 1; i>=0; i--){
    let digit = parseInt(cleanNumber.charAt(i), 10);

    if(isEven){
      digit *=2;
      if(digit > 9)digit -=9;
    }

    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

//is the formating of the expiry right
const isValidExpiry = (expiry) => {
  
  if(!/^\d{2}\/d{2}$/.test(expiry)) return false;

  const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
  return month >= 1 && month <=12 && year >= 0 && year <=99;
};

//establishes ifthe card is expired 
const isExpired = (expiry) => {
  const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
  const now = new Date();
  const currentYear = now.getFullYear()%100;
  const currentMonth = now.getMonth() + 1;

  if(year < currentYear) return true;
  if(year === currentYear && month < currentMonth) return true;
  return false;
}

//formats the card number
const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0] || '');
  const parts = [];

  for(let i=0, len = match.length; i < len; i += 4){
    parts.push(match.substring(i,i+4));
  }

  if(parts.length){
    return parts.join(' ');
  } else {
    return value;
  }
};

//format expiry
const formatExpiry = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if(v.length >= 2) {
    return v.substring(0,2) + (v.length > 2 ? '/' + v.substring(2,4) : '');
  }
  return v;
};

//mask card number, shows only last four digits
const maskCardNumber = (number) => {
  const cleanNumber = number.replace(/\s/g, '');
  const lastFour = cleanNumber.slice(-4);
  return `**** **** **** ${lastFour}`;
};

//encryption
const encryptCardData = (card) => {
  return {
    ...card,
    number: btoa(card.number), //base 64 encoding
    cvv: null, //won't store cvv
    maskedNumber: maskCardNumber(card.number),
    lastFour: card.number.replace(/\s/g, '').slice(-4),
    encryptedAt: new Date().toISOString()
  };
};

  const handleSubmit = (e) => {
    e.preventDefault();
    
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Insecure Payment Demo</h1>
      

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
                setCardDetails({ ...cardDetails, number: e.target.value })
              }
              placeholder="4111 1243 5678 9000"
              className="w-full border p-2 rounded text-gray-500 font-semibold" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-black font-semibold">Expiry (MM/YY)</label>
              <input
                type="text"
                value={cardDetails.expiry}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, expiry: e.target.value })
                }
                placeholder="12/25"
                className="w-full border p-2 rounded text-gray-500 font-semibold"
              />
            </div>
            <div>
              <label className="block mb-1 text-black font-semibold">CVV</label>
              <input
                type="text"
                value={cardDetails.cvv}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, cvv: e.target.value })
                }
                placeholder="124"
                className="w-full border p-2 rounded text-gray-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-black font-semibold">Name on Card</label>
            <input
              type="text"
              value={cardDetails.name}
              onChange={(e) =>
                setCardDetails({ ...cardDetails, name: e.target.value })
              }
              placeholder="Derick Lewis"
              className="w-full border p-2 rounded text-gray-500 font-semibold"
            />
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
            onClick={() => {
              if (storedCards.length === 0) {
                alert("No cards stored yet. submit a card first!");
              } else {
                alert(
                  `Details are not stored securely \n\n${
                    storedCards.length
                  } cards are stored in plain text:\n\n${storedCards
                    .map(
                      (card, i) =>
                        `Card ${i + 1}: ${card.number} | ${
                          card.expiry
                        } | CVV: ${card.expiry} | Name: ${card.name}`
                    )
                    .join("\n")}`
                );
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700"
          >
            Show Stored Cards
          </button>
        </div>
      </div>
    </div>
  );
}
