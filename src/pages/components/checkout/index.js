import { useEffect, useState } from 'react';
import './checkout.css'
import LoadingElement from '../loading_element';
import { API_BASE_URL } from '../../../global';

export default function Checkout({checkoutVisibility, setCheckoutVisibility, totalRelatorios}){

    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const [loadingPreco, setLoadingPreco] = useState(false);
    const [loadingDesconto, setLoadingDesconto] = useState(false);

    const [total, setTotal] = useState(totalRelatorios);
    const [desconto, setDesconto] = useState(0);
    const [cupom, setCupom] = useState(false);
    const [cupomCode, setCupomCode] = useState('');
    const [precoTotal, setPrecoTotal] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [cupomValidoMsg, setCupomValidoMsg] = useState('');

    const [travaInputCupom, setTravaInputCupom] = useState(false);

    const validarPreco = async () => {
        setLoadingPreco(true)
        const response = await fetch(`${API_BASE_URL}/checkout/validar-preco.php`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                totalRelatorios:totalRelatorios
            }),
            credentials:'include'
        });

        const data = await response.json(); 
        if(data.status === "success"){
            setPrecoTotal(data.preco)
            setLoadingPreco(false)
        }
    }

    const validarCupom = async (codigo) => {
        setLoadingDesconto(true)
        if(cupomCode === '') return
        console.log(codigo)
        const response = await fetch(`${API_BASE_URL}/checkout/validar-cupom.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            cupomCode:codigo,
            precoTotal:precoTotal
          }),
          credentials:'include'
        });
    
        const data = await response.json();    
        if(data.status == 'success'){
            setCupom(true);
            setDesconto(data.valorDescontado)
            setPrecoTotal(data.valorTotal)
            setCupomValidoMsg(data.msg)
            setTravaInputCupom(true);
            setLoadingDesconto(false);
        }else{
            setLoadingDesconto(false)
            setErrorMsg(data.msg)
            setCupomValidoMsg('')
        }
    };


    const handleCupom = async (text) => {

        const valorLimpo = text.replace(/[^a-zA-Z0-9]/g, '');

        setCupomCode(valorLimpo);

        if(text.length === 6){
            validarCupom(text);
        }

        if(text.length < 6){
            setErrorMsg('');
            setCupomValidoMsg('')
        }
    }

    const checkout = async () => {
        setLoadingCheckout(true)
        const response = await fetch(`${API_BASE_URL}/stripe/checkout.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            produto: "Relatório",
            preco: precoTotal * 100,
            quantidade: totalRelatorios
          }),
          credentials:'include'
        });
    
        const data = await response.json();
    
        if (data.url) {
          window.location.href = data.url;
          setLoadingCheckout(false)
        }
      };

    useEffect(()=>{
        setLoadingPreco(true)
        validarPreco();
    },[])

    return(
        <div className='checkout-body'>
            <div className='checkout-box'>
                <div className='checkout-cabecalho'>
                    <h1>Adquirir relatórios</h1>
                    <p>Confirme sua compra</p>
                </div>

               
                <p className='checkout-tip'>Você receberá créditos para desbloquear os relatórios posteriormente</p>

                <div className='checkout-cupom'>
                    <p>Aplicar cupom de desonto</p>
                    <input readOnly={travaInputCupom} type='text' placeholder='Insira o cupom' value={cupomCode} onChange={(e)=>{setCupomCode(e.target.value); handleCupom(e.target.value)}} maxLength={6}></input>
                    {errorMsg != '' && 
                        <p className='checkout-cupom-errorMsg' style={{            
                            backgroundColor: errorMsg ? "#c7121265" : "transparent",
                            borderColor: errorMsg ? "#c71212" : "none"
                        }}>{errorMsg}</p>
                    }   
                    {cupomValidoMsg != '' && 
                        <p className='checkout-cupom-validoMsg' style={{            
                            backgroundColor: cupomValidoMsg ? "#06ac0e65" : "transparent",
                            borderColor: cupomValidoMsg ? "#3ad641" : "none"
                        }}>Cupom aplicado</p>
                    }                   
                </div>
                <div className='checkout-descontos'>
                    <p>Total de relatórios</p>
                    <p>{totalRelatorios}</p>
                </div>        
                <div className='checkout-descontos'>
                    <p>Descontos</p>
                    {!loadingDesconto ? <p>R$ {desconto.toString().replace(".",",")}</p> : <LoadingElement color={"#888"} size={0.5}></LoadingElement>}
                </div>        
                <div className='checkout-total'>
                    <h3>Total</h3>
                    <h3>{!loadingPreco ? <><p>R$</p>{precoTotal.toString().replace(".",",")}</> : <LoadingElement color={"#666"} size={0.5}></LoadingElement>}</h3>
                </div>    
                <button onClick={()=>checkout(precoTotal, total)} className="checkout-button">{!loadingCheckout ? 'Ir para pagamento' : <LoadingElement color={"#fff"} size={0.8}></LoadingElement>}</button>
                <button onClick={()=>{setCheckoutVisibility(false)}} className='checkout-close'>Cancelar</button>
            </div>
        </div>
    )
}