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

  const handleSubmit = (e) => {
    e.preventDefault();
    setStoredCards([...storedCards, { ...cardDetails, id: Date.now() }]);
    setCardDetails({ number: "", expiry: "", cvv: "", name: "" });
    alert("Card Stored (In Plain Text!)");
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
