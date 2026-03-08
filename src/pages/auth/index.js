import './autenticacao.css'
import google_logo from '../../assets/google_logo.webp'
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Icon from '@mdi/react';
import { mdiAlertCircleOutline } from '@mdi/js';

export default function Autenticacao({isAuth, setIsAuth}) {


    const navigate = useNavigate();
    useEffect(()=>{
        const auth = localStorage.getItem("auth");
        if (auth === "true") {
            navigate('/')      
        }    
    },[])

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const [erro, setErro] = useState(false);
    const [erroMsg, setErroMsg] = useState('');
    
    const login = async () => {
        
        if(email === ''){
            setErro(true); 
            setErroMsg("Insira o e-mail");
            return;
        } 
        if(senha === ''){
            setErro(true); 
            setErroMsg("Insira a senha");
            return;
        } 

        try{
            const response = await fetch("http://localhost/melocalizae/src/php/auth/login.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                email:email,
                senha:senha
                })
            });
        
            const data = await response.json();
            console.log(data);
            if (data.status == 'success') {
                localStorage.setItem("auth", "true");
                setErro(false);
                setIsAuth(true);
                navigate('/');
            }else{
                localStorage.setItem("auth", "false");
                setErroMsg('E-mail ou senha incorretos');
                setIsAuth(false);
                setErro(true);
            }
        }catch(error){
            localStorage.setItem("auth", "false");
        }
    }

    return(
        <div className="autenticacao_body">
            <div className='autenticacao_box-autenticacao'>
                <div className='autenticacao_title'>
                    <h1>Acessar sua conta</h1>
                    <p>Não possui uma conta? <a href='#'>Cadastre-se!</a></p>
                </div>

                
                <section className='group_default-login'>
                    {erro &&
                    <div className='error-msg'>
                        <p><Icon path={mdiAlertCircleOutline} size={0.75} />{erroMsg}</p>
                    </div>}

                    <div className='auth-input-group_default'>
                        <label for=''>E-mail ou CPF</label>
                        <input type='text' value={email} onChange={(e)=>{setEmail(e.target.value)}} placeholder='Insira seu e-mail ou CPF'></input>
                    </div>
                    <div className='auth-input-group_default'>
                        <label for=''>Senha</label>
                        <input type='password' value={senha} onChange={(e)=>{setSenha(e.target.value)}} placeholder='Insira sua senha'></input>
                    </div>

                    <button onClick={()=>login()}>Acessar</button>
                    <a href='#'>Esqueci minha senha</a>
                </section>

                <section className='divider'>
                    <span></span>
                    <p>Ou</p>
                    <span></span>
                </section>

                <section className='group_alternative-login'>                    
                    <button><img src={google_logo}/>Acessar com o Google</button>
                </section>
            </div>
        </div>
    )
}