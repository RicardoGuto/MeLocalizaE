import './header.css'
import Icon from '@mdi/react';
import { mdiCartOutline, mdiExitToApp, mdiHandCoin, mdiMapSearch, mdiViewDashboard} from '@mdi/js';
import logo_v1 from '../../../assets/logo_vetor_v1.png'
import logo_all_white from '../../../assets/logo_vetor_v1_all_white.png'
import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';

export default function Header({isAuth, setIsAuth}) {

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
          setUserData(data.dados_basicos)
      }else{
          console.log(data.msg)
      }
    }

    useEffect(()=>{getData()},[])

    const [userData, setUserData] = useState([]);

    const navigate = useNavigate();

    const irParaPrecos = () => {
      navigate("/", { state: { scrollToPlanos: true } });
    };


    const logout = async () => {
      const response = await fetch("http://localhost/melocalizae/src/php/auth/logout.php", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          credentials: "include",
      });
  
      const data = await response.json();
      if(data.status === 'success'){
        navigate('/');
        localStorage.setItem('auth', "false");
        window.location.reload();
      }else{
        alert("Erro no logout. Tente novamente.")
      }
    }


  return (
    <div className="header_header-base">
        <img className='header-logo' src={logo_all_white}/>
        <nav>
          <Link to='/'>Início</Link>
          <Link to='/Sobre'>Sobre</Link>
          <button onClick={irParaPrecos}>Adquira relatórios</button>
          <Link to='/FaleConosco'>Fale Conosco</Link>
        </nav>
        <div className="header_header-access">
          {/*<button id='cart-button'><Icon path={mdiCartOutline} size={1.25} color={'#fff'}/></button>*/}
          {isAuth && <p className='saldo-info'><Icon path={mdiHandCoin} size={1} /> {userData.creditos} créditos</p>}
          
          { !isAuth? (
            <div className="header_header-auth">
              <Link to='/Autenticacao'>Entrar</Link>
              <Link to='/Cadastro'>Cadastrar</Link>
            </div>
            ) : (
            <div className="header_header-auth">
              <Link to='/Painel' style={{display:'flex', flexDirection:'row', gap:'5px'}}>
                <Icon path={mdiViewDashboard} size={0.9} color={'#FF6F33'}/>Painel
              </Link>
              <button onClick={()=>{logout()}} className='button-logout' style={{display:'flex', flexDirection:'row', gap:'5px'}}>
                <Icon path={mdiExitToApp} size={0.9} color={'#FFF'}/>Sair
              </button>
            </div>
            )
          }


        </div>
    </div>
    );
}
