import './cadastro.css'
import google_logo from '../../assets/google_logo.webp'
import Icon from '@mdi/react';
import { mdiAlertCircleOutline, mdiEye, mdiEyeClosed } from '@mdi/js'
import { useState } from 'react'
import {API_BASE_URL} from '../../global.js'
import { useNavigate } from "react-router-dom";

export default function Cadastro({isAuth, setIsAuth}) {

    const navigate = useNavigate();

    const [seePassword, setSeePassword] = useState(false);

    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [emailPromo, setEmailPromo] = useState(false);
    const [termos, setTermos] = useState(false)

    const [erro, setErro] = useState(false);
    const [erroMsg, setErroMsg] = useState('');

    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    const validarSenha = (senha) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,24}$/;
        return regex.test(senha);
    }

    const validarCPF = (cpf) => {

        cpf = cpf.replace(/\D/g, '');

        if (cpf.length !== 11) return false;

        // evita 00000000000, 11111111111 etc
        if (/^(\d)\1+$/.test(cpf)) return false;

        let soma = 0;
        let resto;

        for (let i = 1; i <= 9; i++)
            soma += parseInt(cpf.substring(i-1, i)) * (11 - i);

        resto = (soma * 10) % 11;

        if ((resto === 10) || (resto === 11))
            resto = 0;

        if (resto !== parseInt(cpf.substring(9, 10)))
            return false;

        soma = 0;

        for (let i = 1; i <= 10; i++)
            soma += parseInt(cpf.substring(i-1, i)) * (12 - i);

        resto = (soma * 10) % 11;

        if ((resto === 10) || (resto === 11))
            resto = 0;

        if (resto !== parseInt(cpf.substring(10, 11)))
            return false;

        return true;
    }

    const cadastrar = async () => {

        if(nome === ''){
            setErro(true); 
            setErroMsg("Campo 'Nome' não pode ficar em branco");
            return;
        } 
        if(nome.length < 3){
            setErro(true); 
            setErroMsg("Insira um nome realmente válido");
            return;
        } 
        if(sobrenome === ''){
            setErro(true); 
            setErroMsg("Campo 'Sobrenome' não pode ficar em branco");
            return;
        } 
        if(sobrenome.length < 3){
            setErro(true); 
            setErroMsg("Insira um sobrenome realmente válido");
            return;
        } 
        if(email === ''){
            setErro(true); 
            setErroMsg("Campo 'Email' não pode ficar em branco");
            return;
        } 
        if(!validarEmail(email)){
            setErro(true);
            setErroMsg("Insira um e-mail realmente válido");
            return;
        }
        if(cpf === ''){
            setErro(true); 
            setErroMsg("Campo 'CPF' não pode ficar em branco");
            return;
        } 
        if(!validarCPF(cpf)){
            setErro(true);
            setErroMsg("Insira um CPF realmente válido");
            return;
        }
        if(senha === ''){
            setErro(true); 
            setErroMsg("Campo 'Senha' não pode ficar em branco");
            return;
        } 
        if(!validarSenha(senha)){
            setErro(true);
            setErroMsg("A senha deve ter entre 8 e 24 caracteres, incluir uma letra maiúscula, um número e um caractere especial");
            return;
        }
        if(!termos){
            setErro(true); 
            setErroMsg("Você precisa concordar com nossa política de privacidade para se cadastrar");
            return;
        }

        try {
            const response = await fetch(`http://localhost/melocalizae/src/php/auth/cadastro.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials:'include',
                body:JSON.stringify({
                    nome:nome,
                    sobrenome:sobrenome,
                    email:email,
                    cpf:cpf,
                    senha:senha,
                    emailPromo:emailPromo
                })
            });

            const data = await response.json();   
            if(data.status === 'success'){
                localStorage.setItem("auth", "true");
                setIsAuth(true)
                navigate('/');

            }else{
                setErro(true); 
                setErroMsg(data.error);
                localStorage.setItem("auth", "false");
                setIsAuth(false)
            }
           
        } catch (error) {
            console.log('Erro de conexão:', error);
        }
    }


    const handleCpf = (value) => {
        const somenteNumeros = value.replace(/\D/g, '').slice(0, 11);
        setCpf(somenteNumeros);
    }
    return(
        <div className="autenticacao_body">
            <div className='autenticacao_box-autenticacao'>
                <div className='autenticacao_title'>
                    <h1>Cadastro</h1>
                    <p>Já possui uma conta? <a href='#'>Clique para acessar!</a></p>
                </div>
                {erro &&
                    <div className='error-msg' style={{width:400}}>
                        <p><Icon path={mdiAlertCircleOutline} size={0.75} />{erroMsg}</p>
                    </div>}
                <section className='group_double-cadastro'>

                    
                    <div className='auth-input-group_default'>
                        <label for=''>Nome</label>
                        <input type='text' value={nome} onChange={(e)=>setNome(e.target.value)} placeholder='Insira seu nome'></input>
                    </div>
                    <div className='auth-input-group_default'>
                        <label for=''>Sobrenome</label>
                        <input type='text' value={sobrenome} onChange={(e)=>setSobrenome(e.target.value)} placeholder='Insira seu sobrenome'></input>
                    </div>
                </section>

                <section className='group_default-cadastro'>
                    <div className='auth-input-group_default'>
                        <label for=''>E-mail</label>
                        <input type='text' value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Insira seu e-mail'></input>
                    </div>
                    <div className='auth-input-group_default'>
                        <label for=''>CPF</label>
                        <input type='text' value={cpf} onChange={(e)=>handleCpf(e.target.value)} placeholder='Insira seu CPF'></input>
                    </div>
                    <div className='auth-input-group_default'>
                        <label for=''>Senha</label>
                        {!seePassword ? (
                            <input type='password' value={senha} onChange={(e)=>setSenha(e.target.value)} placeholder='Insira sua senha'></input>
                        ):(
                            <input type='text' value={senha} onChange={(e)=>setSenha(e.target.value)} placeholder='Insira sua senha'></input>
                        )
                        }
                        
                        {seePassword ? (
                            <button id='reveal_password' onClick={()=>setSeePassword(false)}>
                                <Icon path={mdiEyeClosed} size={1} />
                            </button>
                        ):(
                            <button id='reveal_password' onClick={()=>setSeePassword(true)}>
                                <Icon path={mdiEye} size={1} />
                            </button>
                        )}                       

                    </div>

                    <div className='group_input-checkbox'>
                        <input type='checkbox' value={termos} onChange={(e)=>setTermos(e.target.checked)}></input>
                        <label for='' >Concordo com os <a href='#'>Termos de uso</a> e <a href='#'>Políticas de Privacidade</a></label>
                    </div>
                    
                    <div className='group_input-checkbox'>
                        <input type='checkbox'  value={emailPromo} onChange={(e)=>setEmailPromo(e.target.checked)}></input>
                        <label for=''>Desejo receber notícias e informações promocionais por e-mail</label>
                    </div>

                    <button onClick={()=>cadastrar()}>Concluir</button>
                </section>
                {/*
                <section className='divider'>
                    <span></span>
                    <p>Ou</p>
                    <span></span>
                </section>

                <section className='group_alternative-cadastro'>                    
                    <button><img src={google_logo}/>Acessar com o Google</button>
                </section>*/}
            </div>
        </div>
    )
}