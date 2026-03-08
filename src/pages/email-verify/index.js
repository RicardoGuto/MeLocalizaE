import './email-verify.css'
import google_logo from '../../assets/google_logo.webp'
import Icon from '@mdi/react';
import { mdiAlertCircleOutline, mdiEye, mdiEyeClosed } from '@mdi/js'
import { useEffect, useState } from 'react'
import {API_BASE_URL} from '../../global.js'
import { useNavigate } from "react-router-dom";

export default function EmailVerify({isAuth, setIsAuth}) {

    const navigate = useNavigate();
    useEffect(() => {
        const auth = localStorage.getItem("auth");
        if (auth === "false") {
            navigate('/Autenticacao')
        }else if (auth === "true"){
            const verified = localStorage.getItem("verificado");
            if (verified === "true") {
                navigate('/')
            }
        }



    }, []);

    const [codigo, setCodigo] = useState('');

    const [erro, setErro] = useState(false);
    const [erroMsg, setErroMsg] = useState('');

    const verificarEmail = async () => {

        if(codigo === ''){
            setErro(true); 
            setErroMsg("Campo 'Código' não pode ficar em branco");
            return;
        } 
        
        if(codigo.length < 6){
            setErro(true); 
            setErroMsg("Código inválido");
            return;
        } 
        
        try {
            const response = await fetch(`http://localhost/melocalizae/src/php/auth/email_verify.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials:'include',
                body:JSON.stringify({
                    codigo:codigo
                })
            });

            const data = await response.json();   
            if(data.status === 'success'){
                localStorage.setItem("verificado", "true");
                navigate('/');
            }else{
                localStorage.setItem("verificado", "false");
                setErro(true); 
                setErroMsg(data.msg);
            }
           
        } catch (error) {
            console.log('Erro de conexão:', error);
        }
    }

    const handleCodigo = (value) => {
        const somenteNumeros = value.replace(/\D/g, '').slice(0, 6);
        setCodigo(somenteNumeros);
    }


    return(
        <div className="autenticacao_body">
            <div className='autenticacao_box-autenticacao'>
                <div className='autenticacao_title'>
                    <h1>Verificação de E-mail</h1>
                    <p>Um e-mail com um código de verificação foi enviado.</p>
                </div>

                {erro &&
                    <div className='error-msg' style={{width:400}}>
                        <p><Icon path={mdiAlertCircleOutline} size={0.75} />{erroMsg}</p>
                    </div>}
                

                <section className='group_default-cadastro'>
                    <div className='auth-input-group_default'>
                        <label for=''>Código</label>
                        <input type='text' value={codigo} onChange={(e) => handleCodigo(e.target.value)} placeholder='Insira o código'></input>
                    </div>                  

                    <button onClick={()=>verificarEmail()}>Concluir</button>
                </section>

            </div>
        </div>
    )
}