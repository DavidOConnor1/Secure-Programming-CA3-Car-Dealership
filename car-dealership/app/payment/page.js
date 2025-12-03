'use client';

import { useState } from "react";

export default function PaymentPage(){
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''

    });

    const [storedCards, setStoredCards] = useState([]);
    

    //stores card details insecurely
    const handleSubmit = (e) => {
        e.preventDefault();
        //storing card in plain text
        setStoredCards([...storedCards, {...cardDetails, id: Date.now() }]);
        setCardDetails({number: '', expiry: '', cvv: '', name: ''});
        alert('Card Stored!')
    };

    

    return (
        <div className="min-h-screen p-4 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Payment</h1>

            {/*Payment Form*/}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">Enter Card Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1">Card Number</label>
                        <input 
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                        placeholder="4111 1243 5678 9000"
                        className="w-full border p-2 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1">Expiry (MM/YY)</label>
                            <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                            placeholder="12/25"
                            className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block mb-1">CVV</label>
                            <input
                            type="text"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                            placeholder="124"
                            className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block mb-1">Name</label>
                            <input
                            type="text"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                            placeholder="Derick Lewis"
                            className="w-full border p-2 rounded" />
                        </div>
                        <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded font-bold">
                            Submit Payment
                        </button>
                    </div>
                </form>
            </div>

           
        </div>
    )
}