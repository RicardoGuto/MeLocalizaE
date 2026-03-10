import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate} from 'react-router-dom';
import Home from './pages/home';
import './App.css'
import Autenticacao from './pages/auth';
import Cadastro from './pages/cadastro';
import Relatorio from './pages/relatorio';
import PreCadastro from './pages/pre_cadastro';
import Painel from './pages/painel';
import { LoadScript } from "@react-google-maps/api";
import Sobre from './pages/sobre';
import PrivacyPolicy from './pages/privacy-policy';
import FaleConosco from './pages/fale-conosco';
import CompraEfetuada from './pages/compra-efetuada';
import CompraCancelada from './pages/compra-cancelada';
import EmailVerify from './pages/email-verify';
import { API_BASE_URL } from './global';

const GOOGLE_API = 'AIzaSyCRJnBSTStmvD5-WUr03HCQNHJ44N4Nz5g';
const libraries = ["places"];

export default function App({}) {

  const [isAuth, setIsAuth] = useState(false);

  const checkAuth = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/protect.php`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          credentials: "include",
      });
  
      const data = await response.json();
      console.log(data.status);
      if (data.status === 'Logado') {
          localStorage.setItem("auth", "true");
          setIsAuth(true)
          await checkVerify();
      }else{
          localStorage.setItem("auth", "false");
          setIsAuth(false)
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
      }else{
          localStorage.setItem("verificado", "false");
      }
  }


  useEffect(()=>{
    checkAuth(); 
  },[])

  return (
    <Router>
      <LoadScript googleMapsApiKey={GOOGLE_API} libraries={libraries}>
      <Routes>
        <Route path="/" element={<Home isAuth={isAuth} setIsAuth={setIsAuth}/>} />
        <Route path="/Autenticacao" element={<Autenticacao isAuth={isAuth} setIsAuth={setIsAuth}/>} />
        <Route path="/Cadastro" element={<Cadastro isAuth={isAuth} setIsAuth={setIsAuth}/>} />
        <Route path="/Relatorio" element={<Relatorio isAuth={isAuth} setIsAuth={setIsAuth}/>} />
        <Route path="/PreCadastro" element={<PreCadastro isAuth={isAuth} setIsAuth={setIsAuth}/>} />
        <Route path="/Painel" element={<Painel isAuth={isAuth} setIsAuth={setIsAuth}/>} />
        <Route path="/Sobre" element={<Sobre isAuth={isAuth} setIsAuth={setIsAuth}/>} />
        <Route path="/PoliticaPrivacidade" element={<PrivacyPolicy isAuth={isAuth} setIsAuth={setIsAuth}/>} />
        <Route path="/FaleConosco" element={<FaleConosco isAuth={isAuth} setIsAuth={setIsAuth}/>} />
        <Route path="/Relatorio" element={<Relatorio isAuth={isAuth} setIsAuth={setIsAuth}/>} />
        <Route path="/CompraEfetuada" element={<CompraEfetuada isAuth={isAuth} setIsAuth={setIsAuth}/>} />
        <Route path="/CompraCancelada" element={<CompraCancelada isAuth={isAuth} setIsAuth={setIsAuth}/>} />
        <Route path="/EmailVerify" element={<EmailVerify isAuth={isAuth} setIsAuth={setIsAuth}/>} />
      </Routes>
      </LoadScript>
    </Router>
  );
}
