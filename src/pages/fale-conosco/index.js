import Header from "../components/header";
import './faleconosco.css'
import { useEffect, useState } from 'react'
import Icon from '@mdi/react';
import { mdiAlertCircleOutline, mdiMessageCheck, mdiMessageDraw } from '@mdi/js';
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import LoadingElement from "../components/loading_element";
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
    const [assunto, setAssunto] = useState('');
    const [categoria, setCategoria] = useState('');
    const [descricao, setDescricao] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const [erro, setErro] = useState(false);
    const [erroMsg, setErroMsg] = useState('');

    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }


    const enviarMensagem = async () => {

        setLoading(true);

        if(nome === ''){
            setErro(true); 
            setErroMsg("Campo 'Nome' não pode ficar em branco");
            setLoading(false);
            return;
        } 
        if(nome.length < 3){
            setErro(true); 
            setErroMsg("Insira um nome realmente válido");
            setLoading(false);
            return;
        } 
        if(email === ''){
            setErro(true); 
            setErroMsg("Campo 'Email' não pode ficar em branco");
            setLoading(false);
            return;
        } 
        if(!validarEmail(email)){
            setErro(true);
            setErroMsg("Insira um e-mail realmente válido");
            setLoading(false);
            return;
        }

        if(assunto === ''){
            setErro(true);
            setErroMsg("Campo 'Assunto' não pode ficar em branco");
            setLoading(false);
            return;
        }
        
        if(categoria === ''){
            setErro(true);
            setErroMsg("Campo 'Categoria' não pode ficar em branco");
            setLoading(false);
            return;
        }
        if(descricao === ''){
            setErro(true);
            setErroMsg("Campo 'Descrição' não pode ficar em branco");
            setLoading(false);
            return;
        }

        try{
            const response = await fetch('http://localhost/melocalizae/src/php/fale-conosco/envio-msg.php',{
                headers: { 'Content-Type': 'application/json' },
                method:'POST',
                credentials:'include',
                body:JSON.stringify({
                    nome:nome,
                    email:email,
                    assunto:assunto,
                    categoria:categoria,
                    descricao:descricao
                })
            })

            const data = await response.json(); 
            if(data.status === 'success'){
                setLoading(false)
                setDone(true);
            }else{
                setLoading(false)
                setDone(false);
            }

        }catch(error){
            console.log(error)
        }
    }

    return(
        <div>
            <Header></Header>
            <div className="faleconosco-body">

               {!done && <div className="faleconosco-form">
                    <h1><Icon path={mdiMessageDraw} size={1} />Deixe sua mensagem!</h1>
                    <p>Responderemos o mais rápido possível dentro de 24 horas no e-mail informado</p>

                    {erro &&
                        <div className='error-msg' style={{width:400}}>
                            <p><Icon path={mdiAlertCircleOutline} size={0.75} />{erroMsg}</p>
                        </div>}

                     <section className='faleconosco-group-form'>
                        <div className='auth-input-group_default'>
                            <label for=''>Nome</label>
                            <input type='text' value={nome} onChange={(e)=>setNome(e.target.value)} placeholder='Insira seu nome' maxLength={50}></input>
                        </div>
                        <div className='auth-input-group_default'>
                            <label for=''>Email</label>
                            <input maxLength={100} type='text' value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Insira seu e-mail'></input>
                        </div>
                        <div className='auth-input-group_default'>
                            <label for='' maxLength={100}>Assunto</label>
                            <input type='text' value={assunto} onChange={(e)=>setAssunto(e.target.value)} placeholder='Insira o assunto'></input>
                        </div>
                        <div className='auth-input-group_default'>
                            <label for=''>Categoria de solicitação</label>
                            <select value={categoria} onChange={(e)=>setCategoria(e.target.value)} >
                                <option value={''}>Selecione uma opção</option>
                                <option value={'ProblemaPagamento'}>Problema com pagamento</option>
                                <option value={'ProblemaRelatorio'}>Problema com relatório</option>
                                <option value={'ProblemaCuppom'}>Problema com cupom de desconto</option>
                                <option value={'Outro'}>Outro</option>
                            </select>
                        </div>
                        <div className='auth-input-group_default'>
                            <label for=''>Descreva sua solicitação (máx. 1000 caracteres)</label>
                            <textarea style={{resize:'none'}} maxLength={500} value={descricao} onChange={(e)=>setDescricao(e.target.value)}></textarea>
                        </div>     

                        <button onClick={()=>{enviarMensagem();}}>{!loading ? 'Enviar' : <LoadingElement color={"#fff"} size={1}></LoadingElement>}</button>                   
                    </section>
                </div>}

               {done && <div className="mensagem-enviada" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <span><Icon path={mdiMessageCheck} size={5} color={'#3ad641'}/></span>
                    <h1 style={{color:'#444'}}>Sua mensagem foi enviada!</h1>
                    <p style={{color:'#888'}}>Retornaremos o contato dentro das próximas horas</p>
                </div>}

            </div>

            <Footer></Footer>
        </div>
    )
}