import './autenticacao.css'
import google_logo from '../../assets/google_logo.webp'
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Icon from '@mdi/react';
import { mdiAlertCircleOutline } from '@mdi/js';
import LoadingElement from '../components/loading_element';
import { API_BASE_URL } from '../../global';

export default function Autenticacao({isAuth, setIsAuth}) {


    const navigate = useNavigate();
    useEffect(()=>{
        const auth = localStorage.getItem("auth");
        const verified = localStorage.getItem("verificado");
        if (auth === "true") {
            if(verified === "false"){
                navigate('/EmailVerify')
            }else{
                navigate('/')  
            }
    
        }    
    },[])

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [erro, setErro] = useState(false);
    const [erroMsg, setErroMsg] = useState('');
    
    const login = async () => {
        if(loadingLogin) return;
        setLoadingLogin(true);

        if(email === ''){
            setErro(true); 
            setErroMsg("Insira o e-mail");
            setLoadingLogin(false);
            return;
        } 
        if(senha === ''){
            setErro(true); 
            setErroMsg("Insira a senha");
            setLoadingLogin(false);
            return;
        } 

        try{
            const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
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
                if(!checkVerify()){
                    navigate('/EmailVerify')
                    setLoadingLogin(false);
                }else{
                    navigate('/');
                    setLoadingLogin(false);
                }

            }else{
                localStorage.setItem("auth", "false");
                setErroMsg('E-mail ou senha incorretos');
                setIsAuth(false);
                setErro(true);
                setLoadingLogin(false);
            }
        }catch(error){
            localStorage.setItem("auth", "false");
            setLoadingLogin(false);
        }
    }

    const checkVerify = async () => {
        const response = await fetch(`${API_BASE_URL}/auth/check-verify.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        });
    
        const data = await response.json();
        console.log("retorno bd:" , JSON.stringify(data));
        if (data.status === 'success') {
            localStorage.setItem("verificado", "true");
            return "true";
        }else{
            localStorage.setItem("verificado", "false");
            return "false";
        }
    }

    return(
        <div className="autenticacao_body">
            <div className='autenticacao_box-autenticacao'>
                <div className='autenticacao_title'>
                    <h1>Acessar sua conta</h1>
                    <p>Não possui uma conta? <a href='/Cadastro'>Cadastre-se!</a></p>
                </div>

                
                <section className='group_default-login'>
                    {erro &&
                    <div className='error-msg'>
                        <p><Icon path={mdiAlertCircleOutline} size={0.75} />{erroMsg}</p>
                    </div>}

                    <div className='auth-input-group_default'>
                        <label for=''>E-mail</label>
                        <input type='text' value={email} onChange={(e)=>{setEmail(e.target.value)}} placeholder='Insira seu e-mail ou CPF'></input>
                    </div>
                    <div className='auth-input-group_default'>
                        <label for=''>Senha</label>
                        <input type='password' value={senha} onChange={(e)=>{setSenha(e.target.value)}} placeholder='Insira sua senha'></input>
                    </div>

                    <button onClick={()=>login()}>{!loadingLogin ? 'Acessar' : <LoadingElement color={"#fff"} size={1}></LoadingElement>}</button>
                    <a href='#'>Esqueci minha senha</a>
                </section>

                {/*<section className='divider'>
                    <span></span>
                    <p>Ou</p>
                    <span></span>
                </section>

                <section className='group_alternative-login'>                    
                    <button><img src={google_logo}/>Acessar com o Google</button>
                </section>*/}
            </div>
        </div>
    )
}