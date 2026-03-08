import { useEffect, useState } from "react";
import Header from "../components/header";
import "./painel.css"
import Icon from '@mdi/react';
import { mdiChevronRight } from '@mdi/js';
import { useNavigate } from "react-router-dom";

export default function Painel({isAuth, setIsAuth}){  

    const navigate = useNavigate();
    useEffect(() => {
        const auth = localStorage.getItem("auth");
        if (auth === "false") {
            navigate('/Autenticacao')
        }
    }, []);

    const [view, setView] = useState('relatorios');
    const [userData, setUserData] = useState([]);

    const [relatoriosAdquiridos, setRelatoriosAdquiridos] = useState([]);
    const [pagamentosRealizados, setPagamentosRealizados] = useState([]);

    const [cep, setCep] = useState('');
    const [endereco, setEndereco] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');

    const buscarCep = async (cepDigitado) => {
        const cepLimpo = cepDigitado.replace(/\D/g, '');

        if (cepLimpo.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();

            if (data.erro) {
                console.log('CEP não encontrado');
                return;
            }

            setCep(data.cep || cepLimpo);
            setEndereco(data.logradouro || '');
            setBairro(data.bairro || '');
            setCidade(data.localidade || '');
            setUf(data.uf || '');
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    };


    const getData = async()=>{
        const response = await fetch("http://localhost/melocalizae/src/php/dados-usuario/get_user_data.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        });
    
        const data = await response.json();
        console.log(data);
        if (data.status === 'success') {
            setUserData(data)
            setCep(data.dados_basicos.cep)
            setEndereco(data.dados_basicos.endereco)
            setNumero(data.dados_basicos.numero)
            setBairro(data.dados_basicos.bairro)
            setComplemento(data.dados_basicos.complemento)
            setCidade(data.dados_basicos.cidade)
            setUf(data.dados_basicos.estado)
        }else{
            console.log(data.msg)
        }
    }


    useEffect(()=>{getData(); get_relatorios(); getPagamentos()},[view])

    const atualizarEndereco = async () => {
        const response = await fetch("http://localhost/melocalizae/src/php/dados-usuario/atualizar_endereco.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                cep:cep,
                endereco:endereco,
                numero:numero,
                complemento:complemento,
                bairro:bairro,
                cidade:cidade,
                uf:uf
            }),
            credentials: "include",
        });
    
        const data = await response.json();
        console.log(data);
        if (data.status === 'success') {

        }else{
            console.log(data.msg)
        }
    }
    

    const get_relatorios = async () => {
        const response = await fetch("http://localhost/melocalizae/src/php/dados-usuario/meus-relatorios.php",{
            method:'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials:'include'
        })

        const data = await response.json();
        console.log(data);
        if (data.status === 'success') {
            setRelatoriosAdquiridos(data.relatorios_adquiridos);
        }else{
            console.log(data.msg)
        }
    }

    const getPagamentos = async () => {
        const response = await fetch('http://localhost/melocalizae/src/php/dados-usuario/meus-pagamentos.php',{
            method:'POST',
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include"
        });

        const data = await response.json();
        console.log(data)
        if(data.status === 'success'){
            setPagamentosRealizados(data.pagamentos_realizados)
        }else{
            console.log(data.msg)
        }
    }

    const [senhaAtual, setSenhaAtual] = useState('')
    const [senhaNova, setSenhaNova] = useState('')
    const [senhaConfirmar, setSenhaConfirmar] = useState('')

    const alterarSenha = async () => {

        if(senhaNova != senhaConfirmar){
            return alert('Confirme sua nova senha. As senhas não coincidem.')
        }


        const response = await fetch('http://localhost/melocalizae/src/php/dados-usuario/alterar-senha.php',{
            method:'POST',
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                senhaAtual:senhaAtual,
                senhaNova:senhaNova,
            }),
            credentials:'include'
        });

        const data = await response.json();
        if (data.status === "success"){
            alert('Senha alterada com sucesso');
        }else{
            alert(data.msg)
        }
    }

    return (
    <div>
        <Header  isAuth={isAuth} setIsAuth={setIsAuth}/>

        <div className="painel_conteudo">

            <div className="painel_items">
                <div className="painel_items_group">
                    <h2>Atividade</h2>
                    <button onClick={()=>setView('relatorios')}>Meus relatórios</button>
                    <button onClick={()=>setView('historicoPagamentos')}>Histórico de pagamentos</button>
                </div>
                <div className="painel_items_group">
                    <h2>Conta</h2>
                    <button onClick={()=>setView('meusDados')}>Meus dados</button>
                    <button onClick={()=>setView('endereco')}>Endereço</button>
                    <button onClick={()=>setView('alterarSenha')}>Alterar senha</button>
                </div>
                <div className="painel_items_group">
                    <h2>Ajuda</h2>
                    <button>FAQ</button>
                    <button>Suporte</button>
                    <button>Termos de uso</button>
                    <button>Política de privacidade</button>
                </div>                   
            </div>


            {view === 'relatorios' && 
            <div className="item-content">
                <h1>Meus relatórios</h1>
                <h2>Veja os endereços já extraídos</h2>

                <div className="meus-relatorios_group">
                    {relatoriosAdquiridos.map((relatorio)=>
                        <a href={`/Relatorio?cep=${relatorio.cep}`} className="meus-relatorios_group_relatorio">
                            <div className="nomes">
                                <h3>{relatorio.rua || "Nome da rua indisponível*"}</h3>
                                <p>{relatorio.cep}</p>
                            </div>
                            <h3>{relatorio.bairro}</h3>
                            <h3>{relatorio.cidade}</h3>
                            <p>{relatorio.data_aquisicao}</p>
                            <Icon path={mdiChevronRight} size={1} color={'#fc7b44'}/>
                        </a>
                    
                    )}    

                    {relatoriosAdquiridos.length === 0 && (
                        <div>
                            <p>Você ainda não desbloqueou nenhum relatório</p>
                        </div>
                    )}               
                </div>
            </div>                
            }

            {view === 'historicoPagamentos' && 
            <div className="item-content">
                <h1>Histórico de pagamentos</h1>
                <h2>Acesse informações referentes aos pagamentos realizados</h2>

                {pagamentosRealizados.map((pagamento)=>
                    <div className="meus-relatorios_group">
                        <a href={`/CompraEfetuada?session_id=${pagamento.stripe_id}`} className="meus-relatorios_group_relatorio">
                            <div className="nomes">
                                <h3>{pagamento.produto}</h3>
                                <p>{pagamento.quantidade} un.</p>
                            </div>
                            <h3>R$ {pagamento.valor}</h3>
                            {/*<h3>Cartão de crédito</h3>*/}
                            <p>Adquirido em {pagamento.data_pagamento}</p>
                            <Icon path={mdiChevronRight} size={1} color={'#fc7b44'}/>
                        </a>
                    </div>
                
                )}
                
            </div>                
            }

            {view === 'meusDados' && 
            <div className="item-content">
                <h1>Meus dados</h1>
                <h2>Visualize e altere dados de sua conta</h2>

                <div className="meus-dados_group">
                    <div className="inputGroup">
                        <label>Nome</label>
                        <input type="text" value={userData.dados_basicos.nome} readOnly></input>
                    </div>
                    <div className="inputGroup">
                        <label>Sobrenome</label>
                        <input type="text" value={userData.dados_basicos.sobrenome}></input>
                    </div>
                    <div className="inputGroup">
                        <label>CPF</label>
                        <input type="text" value={userData.dados_basicos.cpf} readOnly></input>
                    </div>
                    <div className="inputGroup">
                        <label>E-mail</label>
                        <input type="text" value={userData.dados_basicos.email}></input>
                    </div>
                    <button>Salvar</button>
                </div>
            </div>                
            }

            {view === 'endereco' && 
            <div className="item-content">
                <h1>Endereço</h1>
                <h2>Complete dados de sua localização atual</h2>
                {userData && Object.keys(userData).length > 0 &&                              
                <div className="meus-dados_group">
                    <div className="inputGroup">
                        <label>CEP</label>
                        <input type="text" value={cep} onChange={(e) => {setCep(e.target.value); if(cep.length === 8) buscarCep(cep)}}></input>
                    </div>
                    <div className="inputGroup">
                        <label>Endereço</label>
                        <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)}></input>
                    </div>
                    <div className="inputGroup">
                        <label>Número</label>
                        <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)}></input>
                    </div>
                    <div className="inputGroup">
                        <label>Complemento</label>
                        <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)}></input>
                    </div>
                    <div className="inputGroup">
                        <label>Bairro</label>
                        <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)}></input>
                    </div>
                    <div className="inputGroup">
                        <label>Cidade</label>
                        <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)}></input>
                    </div>
                    <div className="inputGroup">
                        <label>UF</label>
                        <input type="text" value={uf} onChange={(e) => setUf(e.target.value)}></input>
                    </div>
                    <button onClick={()=>atualizarEndereco()}>Salvar</button>
                </div>
                }
            </div>                
            }

            {view === 'alterarSenha' && 
            <div className="item-content">
                <h1>Alterar senha</h1>
                <h2>Preencha os campos para alterar sua senha</h2>

                <div className="meus-dados_group">
                    <div className="inputGroup">
                        <label>Senha atual</label>
                        <input type="password" value={senhaAtual} onChange={(e)=>setSenhaAtual(e.target.value)}></input>
                    </div>
                    <div className="inputGroup">
                        <label>Nova senha</label>
                        <input type="password" value={senhaNova} onChange={(e)=>setSenhaNova(e.target.value)}></input>
                    </div>
                    <div className="inputGroup">
                        <label>Confirme a nova senha</label>
                        <input type="password" value={senhaConfirmar} onChange={(e)=>setSenhaConfirmar(e.target.value)}></input>
                    </div>                    
                    <button onClick={()=>{alterarSenha()}}>Salvar</button>
                </div>
            </div>                
            }

            

        </div>
    </div>

    )
}