import Header from "../components/header";
import './faleconosco.css'
import { useEffect, useState } from 'react'
import Icon from '@mdi/react';
import { mdiMessageDraw } from '@mdi/js';
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
export default function FaleConosco({isAuth, setIsAuth}){

    const navigate = useNavigate();

    useEffect(() => {
        const verified = localStorage.getItem("verificado");
        const auth = localStorage.getItem("auth");
        if(auth === "true"){
            if(verified === "false"){
                navigate('/EmailVerify')
            }
        }
    }, []);

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');

    return(
        <div>
            <Header></Header>
            <div className="faleconosco-body">

                <div className="faleconosco-form">
                    <h1><Icon path={mdiMessageDraw} size={1} />Deixe sua mensagem!</h1>
                    <p>Responderemos o mais rápido possível dentro de 24 horas no e-mail informado</p>
                    <section className='faleconosco-group-form'>
                        <div className='auth-input-group_default'>
                            <label for=''>Nome</label>
                            <input type='text' value={nome} onChange={(e)=>setNome(e.target.value)} placeholder='Insira seu nome'></input>
                        </div>
                        <div className='auth-input-group_default'>
                            <label for=''>Email</label>
                            <input type='text' value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Insira seu e-mail'></input>
                        </div>
                        <div className='auth-input-group_default'>
                            <label for=''>Assunto</label>
                            <input type='text' value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Insira seu e-mail'></input>
                        </div>
                        <div className='auth-input-group_default'>
                            <label for=''>Categoria de solicitação</label>
                            <select type='text' value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Insira seu e-mail'>
                                <option value={''}>Selecione uma opção</option>
                                <option value={''}>Problema com pagamento</option>
                                <option value={''}>Problema com relatório</option>
                                <option value={''}>Problema com cupom de desconto</option>
                                <option value={''}>Outro</option>
                            </select>
                        </div>
                        <div className='auth-input-group_default'>
                            <label for=''>Categoria de solicitação</label>
                            <textarea style={{resize:'none'}}></textarea>
                        </div>     

                        <button>Enviar</button>                   
                    </section>
                </div>

            </div>

            <Footer></Footer>
        </div>
    )
}