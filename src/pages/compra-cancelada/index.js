import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/header";
import Icon from '@mdi/react';
import { mdiCashCheck, mdiCashClock, mdiCashPlus } from "@mdi/js";
import './compra-efetuada.css'
import Footer from "../components/footer";

export default function CompraCancelada({isAuth, setIsAuth}){
    
    const navigate = useNavigate();

    useEffect(()=>{
        const auth = localStorage.getItem("auth");
        if (auth === "false") {
            navigate('/')      
        }    
    },[])


    return(
        <div>
            <Header isAuth={isAuth} setIsAuth={setIsAuth}></Header>

            <div className="compraEfetuada_body">

            
            

            <div className="compraEfetuada_msg-status">
                <h2>Status de pagamento</h2>                
                
                <h1 style={{borderColor: '#dd3b12', backgroundColor: '#dd3b1221', color:'#dd3b12' }}>Compra cancelada</h1>
                
                <p>Nenhum valor foi debitado</p>
            </div>

            <div className="compraEfetuada_msg-final">
                <p style={{textAlign:'justify'}}>Ficamos tristes por você optar não seguir com sua compra. Caso tenha alguma crítica, sugestão ou acha que podemos te ajudar com algo, entre em contato com o suporte:</p>
                <div className="compraEfetuada_msg-final-btgroup">
                    <button onClick={()=>{window.location.href = '/FaleConosco'}}>Falar com o suporte</button>
                </div>
                <p style={{fontSize:14, fontStyle:'italic'}}>Responderemos o mais rápido possível via e-mail.</p>
            </div>

            </div>

            <Footer></Footer>
        </div>
    )

}