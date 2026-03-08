import './pre_cadastro.css'
import google_logo from '../../assets/google_logo.webp'
import logo_v1 from '../../assets/logo_vetor_v1.png'
import logo_all_white from '../../assets/logo_vetor_v1_all_white.png'
import { useState } from 'react'
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js'
import Popup from '../components/popup'

export default function PreCadastro() {

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [celular, setCelular] = useState('');
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    function maskPhone(value) {
        value = value.replace(/\D/g, "");
        value = value.replace(/^(\d{2})(\d)/, "($1) $2");
        value = value.replace(/(\d{5})(\d)/, "$1-$2");
        return value;
    }

    function handleChange(e) {
        const masked = maskPhone(e);
        setCelular(masked);
    }


    const concluir = async () => {
        if(nome === '') return erro('Dados incompletos', 'O campo de Nome não pode ficar em branco', 'ok', 'erro')
        if(email === '') return erro('Dados incompletos', 'O campo de E-mail não pode ficar em branco', 'ok', 'erro')
        if(celular === '') return erro('Dados incompletos', 'O campo de Celular não pode ficar em branco', 'ok', 'erro')

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexCelular = /^\(?\d{2}\)?\s?9\d{4}-?\d{4}$/;

        if (!regexEmail.test(email)) {
            return erro('E-mail inválido', 'Por favor, insira um e-mail válido', 'ok', 'erro')
        }

        if (!regexCelular.test(celular)) {
            return erro('Celular inválido', 'Por favor, insira um celular válido com o DDD', 'ok', 'erro')
        }
                
        setLoading(true);

        try{
            const response = await fetch('https://melocalizae.com.br/php/pre_cadastro/pre_cadastro.php',{
                method:'POST',
                headers: { "Content-Type": "application/json" },
                body:JSON.stringify({
                    nome:nome,
                    email:email,
                    celular:celular
                })
            })

            const data = await response.json();
            if(data.status === 'success'){
                setLoading(false);
                setDone(true);
                setLoading(false);
            }else{
                if(data.msg === 'E-mail já utilizado no pré-cadastro.'){
                    setLoading(false);
                    setDone(false);
                    erro('Erro', 'E-mail já utilizado no pré-cadastro', 'ok', 'erro')
                }                
                else if(data.msg === 'Celular já utilizado no pré-cadastro.'){
                    setLoading(false);
                    setDone(false);
                    erro('Erro', 'Celular já utilizado no pré-cadastro', 'ok', 'erro')
                }
                else{
                    erro('Erro', data.msg, 'ok', 'erro')
                }  
            }

        }catch(error){
            console.error(error)
        }
    }

    /*Controle Popup */
    const [popupTitulo, setPopupTitulo] = useState('');
    const [popupMsg, setPopupMsg] = useState('');
    const [popupOpcoes, setPopupOpcoes] = useState('');
    const [popupIcone, setPopupIcone] = useState('');
    const [popup, setPopup] = useState(false);
    
    const erro = async (titulo, msg, opcoes, icone) => {
        setPopup(true)        
        setPopupTitulo(titulo)
        setPopupMsg(msg)
        setPopupOpcoes(opcoes)
        setPopupIcone(icone)
        setPopup(true)
    }

    return(
        <div className="pre-cadastro_body">

            <div className='pre-cadastro_box-pre-cadastro'>
                <div className='mini-divider'></div>
                <img src={logo_v1}></img>
                {!done && !loading && 
                <div className='pre-cadastro_title'>
                    <h1>Pré-cadastro</h1>
                    <p>Aproveite agora e receba um cupom para seu primeiro relatório!</p>
                </div>
                }

                
                {!done && !loading && 
                <section className='group_default-login'>
                    <div className='auth-input-group_default'>
                        <label htmlFor='nome'>Nome</label>
                        <input type='text' id='nome' placeholder='Insira seu nome' value={nome} onChange={(text)=>{setNome(text.target.value)}}></input>
                    </div>
                    <div className='auth-input-group_default'>
                        <label htmlFor='email'>E-mail</label>
                        <input type='text' id='email' placeholder='Insira seu e-mail' value={email} onChange={(text)=>{setEmail(text.target.value)}}></input>
                    </div>
                    <div className='auth-input-group_default'>
                        <label htmlFor='celular' >Celular com DDD</label>
                        <input type='text' id='celular' placeholder='Insira seu celular' value={celular} onChange={(text)=>{handleChange(text.target.value)}}></input>
                    </div>


                    <button type='button' onClick={()=>concluir()}>Avançar</button>
                    <a href='#'>Ao realizar o pré cadastro você concorda com nossa política de privacidade</a>


                </section>}

                {!done && loading && <section className='done-group'>
                    <span className='loading_ic'><Icon path={mdiLoading} size={2} color={'#fc7b44'}/></span>
                </section>}

                {done && !loading && <section className='done-group'>
                    <h1>Pré-cadastro concluído</h1>
                    <p>Você receberá um e-mail com seu cupom de desconto para usar na hora de comprar um relatório.</p>
                    <a href='#'>Não recebi o e-mail</a>
                </section>}

            </div>

            {popup && <div className='popup_screen'>
                <Popup titulo={popupTitulo} mensagem={popupMsg} opcoes={popupOpcoes} icone={popupIcone} setPopup={setPopup} popup={popup}></Popup>
            </div>}

        </div>
    )
}