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
    const [search, setSearch] = useState('');

    //stores card details insecurely
    const handleSubmit = (e) => {
        e.preventDefault();
        //storing card in plain text
        setStoredCards([...storedCards, {...cardDetails, id: Date.now() }]);
        setCardDetails({number: '', expiry: '', cvv: '', name: ''});
        alert('Card Stored!')
    };

    //SQL injection simulation
    const searchCards = () => {
        //String concatenation
        const fakeQuery = `SELECT * FROM cards WHERE number LIKE '%${search}'`;
        alert(`simulated query: ${fakeQuery} \nTry: ' OR '1'='1' --`);
    };

    return (
        <div className=""
    )
}