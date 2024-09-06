// `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`

import { useEffect, useState } from "react";

export default function App() {
    const [curra, setCurra] = useState("EUR");
    const [currb, setCurrb] = useState("USD");
    const [value, setValue] = useState("");
    const [amount, setAmount] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

        
    useEffect(function () {
        async function getData() {
            if (curra!==currb){

                try {
                    setIsLoading(true);
                    const res = await fetch(
                        `https://api.frankfurter.app/latest?amount=${amount}&from=${curra}&to=${currb}`
                    );
                    const data = await res.json();
                    setValue(data.rates[currb]);
                    setIsLoading(false);
                } catch (error) {
                    console.log(error.message);
                    setValue(error.message);                    
                }
            } else setValue(amount);

            if (!amount) setValue("OUTPUT")
        }
        getData();
    }, [amount, curra, currb]);

    return (
        <div>
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isLoading} />
            <Select curr={curra} disabled={isLoading} onCurr={setCurra}/>
            <Select curr={currb} disabled={isLoading} onCurr={setCurrb}/>
            <p>{value}</p>
        </div>
    );
}

function Select({curr, onCurr, disabled}) {

    function handleSetCurr(val){
        onCurr(val);
    }
    return (
        <select value={curr} onChange={(e) => handleSetCurr(e.target.value)} disabled={disabled}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CAD">CAD</option>
            <option value="INR">INR</option>
        </select>
    );
}
