import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/header";
import Icon from '@mdi/react';
import { mdiCashCheck, mdiCashClock, mdiCashPlus } from "@mdi/js";
import './compra-efetuada.css'
import Footer from "../components/footer";
import LoadingElement from "../components/loading_element";

export default function CompraEfetuada({isAuth, setIsAuth}){
    
    const navigate = useNavigate();

    useEffect(() => {
        const verified = localStorage.getItem("verificado");
        const auth = localStorage.getItem("auth");
        if (auth === "false") {
            navigate('/Autenticacao')
        }else if(auth === "true"){
            if(verified === "false"){
              navigate('/EmailVerify')
            }
        }
    }, []);

    const [loading, setLoading] = useState(true)
    const [statusPagamento, setStatusPagamento] = useState(false);
    const [metodoPagamento, setMetodoPagamento] = useState(false);

    //Requisição para capturar dados do pagamento
    useEffect(() => {

        const verificarPagamento = async () => {
            setLoading(true);
            const session_id = new URLSearchParams(window.location.search)
                .get("session_id");

            const response = await fetch(
                "http://localhost/melocalizae/src/php/stripe/consultar_status.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        session_id
                    }),
                    credentials:'include'
                }
            );

            const data = await response.json();
            console.log(data)
            if(data.status === "paid"){
                console.log("Pagamento confirmado");
                setStatusPagamento(true)
                setMetodoPagamento(data.metodo_pagamento)
                setLoading(false);
            }else if(data.status === "unpaid"){
                console.log("Aguardando pagamento")
                setStatusPagamento(false)
                setMetodoPagamento(data.metodo_pagamento)
                setLoading(false);
            }
        }

        verificarPagamento();

    }, []);


    return(
        <div>
            <Header isAuth={isAuth} setIsAuth={setIsAuth}></Header>

            <div className="compraEfetuada_body">

            {loading && <LoadingElement color={"#fc7b44"} size={3}></LoadingElement>}
            
            {!loading && <div className="compraEfetuada_header-status">            
                <div className="compraEfetuada_icon-status" style={{borderColor: statusPagamento ? '#3ad641' : '#3ad641'}}>
                    <Icon className="compraEfetuada_icon" path={mdiCashPlus} size={1.5} style={{color: statusPagamento ? '#3ad641' : '#3ad641'}} />
                </div>
                <div className="compraEfetuada_line-status" style={{backgroundColor: statusPagamento ? '#3ad641' : '#3ad641'}}></div>
                <div className="compraEfetuada_icon-status" style={{borderColor: statusPagamento ? '#3ad641' : '#3ad641'}}>
                    <Icon className="compraEfetuada_icon" path={mdiCashClock} size={1.5} style={{color: statusPagamento ? '#3ad641' : '#3ad641'}}/>
                </div>
                <div className="compraEfetuada_line-status" style={{backgroundColor: statusPagamento ? '#3ad641' : '#ccc'}}></div>
                <div className="compraEfetuada_icon-status" style={{borderColor: statusPagamento ? '#3ad641' : '#ccc'}}>
                    <Icon className="compraEfetuada_icon" path={mdiCashCheck} size={1.5} style={{color: statusPagamento ? '#3ad641' : '#ccc'}}/>
                </div>              
            </div>}

            {!loading && <div className="compraEfetuada_msg-status">
                <h2>Status de pagamento</h2>
                
                {statusPagamento ? 
                <h1 style={{borderColor: '#3ad641', backgroundColor: '#3ad64221', color:'#3ad641' }}>Pagamento concluído</h1> 
                : 
                <h1 style={{borderColor: '#dd8c12', backgroundColor: '#dd8c1221', color:'#dd8c12' }}>Aguardando pagamento</h1>
                }

                <p>Os créditos são adicionados à sua conta logo após o pagamento ser processado.</p>
            </div>}

            {!loading && <div className="compraEfetuada_msg-metodo">
                <h2>Método de pagamento</h2>
                
                {metodoPagamento === 'card' ? <h1>Cartão de crédito</h1> 
                : metodoPagamento === 'pix' ? <h1>Pix</h1>:
                metodoPagamento === 'boleto' ? <h1>Boleto bancário</h1>: <h1>Método desconhecido</h1>}
            </div>}

            {statusPagamento && !loading ? 
            
            <div className="compraEfetuada_msg-final">
                <p>Você já pode desbloquear um novo relatório!</p>
                <div className="compraEfetuada_msg-final-btgroup">
                    <button onClick={()=>{window.location.href = '/'}}>Desbloquear relatórios</button>
                    <button onClick={()=>{window.location.href = '/FaleConosco'}}>Tive um problema</button>
                </div>
            </div>
            : !statusPagamento && !loading ? 
            <div className="compraEfetuada_msg-final">
                <p style={{textAlign:'justify'}}>O pagamento ainda não foi confirmado. Aguarde a confirmação em até 24 horas. Caso não tenha realizado o pagamento e acredita se tratar de um erro, escolha a opção abaixo:</p>
                <div className="compraEfetuada_msg-final-btgroup">
                    <button onClick={()=>{window.location.href = '/FaleConosco'}}>Falar com o suporte</button>
                </div>
                <p style={{fontSize:14, fontStyle:'italic'}}>Responderemos o mais rápido possível via e-mail.</p>
            </div> : null            
            }
            </div>

            <Footer></Footer>
        </div>
    )

}