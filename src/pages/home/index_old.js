import Header from "../components/header";
import './home.css'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from '@mdi/react';
import { mdiMapSearch, mdiMagnify, mdiCheckCircleOutline, mdiCloseCircleOutline, mdiStarCheck, mdiPoliceBadgeOutline, mdiChevronDown, mdiChevronUp, mdiMessage, mdiMap, mdiChevronLeft, mdiChevronRight, mdiStar } from '@mdi/js';
import Footer from "../components/footer";
import logo_v1 from '../../assets/logo_vetor_v1.png'
import logo_all_white from '../../assets/logo_vetor_v1_all_white.png'
import Checkout from "../components/checkout";

const GOOGLE_API = 'AIzaSyCRJnBSTStmvD5-WUr03HCQNHJ44N4Nz5g';

const avaliacoes = [
    {
      nome: "Higor Rocha",
      data: "18 de Outubro de 2025",
      texto:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel bibendum odio, ac congue justo. Suspendisse potenti.",
    },
    {
      nome: "Amanda Silva",
      data: "10 de Outubro de 2025",
      texto:
        "Praesent nec neque faucibus, sodales velit ut, interdum eros. Maecenas quis pellentesque massa.",
    },
    {
      nome: "Lucas Pereira",
      data: "5 de Outubro de 2025",
      texto:
        "Phasellus malesuada quam erat, maximus cursus magna efficitur in.",
    },
  ];

export default function Home() {



  const [checkoutVisibility, setCheckoutVisibility] = useState(false)

  //BLOCOS APRESENTAÇÃO
  const [infoCriminalidade, setInfoCriminalidade] = useState(false);
  const [infoOpinioes, setInfoOpinioes] = useState(false);
  const [infoDadosDemograficos, setInfoDadosDemograficos] = useState(false);


  //Avaliações
  const [indice, setIndice] = useState(0);

  const anterior = () => {
    setIndice((prev) => (prev === 0 ? avaliacoes.length - 1 : prev - 1));
  };

  const proximo = () => {
    setIndice((prev) => (prev === avaliacoes.length - 1 ? 0 : prev + 1));
  };

  const atual = avaliacoes[indice];

  //PERGUNTAS FREQUENTES
  const [duvida1, setDuvida1] = useState(false);
  const [duvida2, setDuvida2] = useState(false);
  const [duvida3, setDuvida3] = useState(false);
  const [duvida4, setDuvida4] = useState(false);


  //CONSULTA DE CEP / LOGRADOURO
  const [searchLocalidade, setSearchLocalidade] = useState('');
  const navigate = useNavigate();
  const [sugestoes, setSugestoes] = useState([]);
  const [scriptCarregado, setScriptCarregado] = useState(false);

  useEffect(() => {
    if (!scriptCarregado || searchLocalidade.length < 3) {
      setSugestoes([]);
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      {
        input: searchLocalidade,
        types: ["(regions)"],
        language: "pt-BR",
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSugestoes(predictions.slice(0, 5));
        } else {
          setSugestoes([]);
        }
      }
    );
  }, [searchLocalidade, scriptCarregado]);
  
  const consultar = async () => {
      if(searchLocalidade == '') return
      if(searchLocalidade.length < 8) return

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchLocalidade)}&components=country:BR&key=${GOOGLE_API}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
          const resultado = data.results[0];  
          
          const estadoComp = resultado.address_components.find(c =>
            c.types.includes("administrative_area_level_1")
          );

          if (estadoComp?.short_name === "SP") {
            navigate('/Relatorio', { state: { resultado } })
          }else{
            return
          }

          
        } else {
          console.error("Erro da API:", data.status);
        }
      } catch (erro) {
        console.error("Erro na requisição:", erro);
      }
  }

  return (
    <div>
        <Header/>
        <div className="home_top-banner">
            <div className="home_box-search">
              <img className="home_box-logo" src={logo_v1}/>
              <h1>Fique de olho na região!</h1>
              <p>Faça sua consulta para receber um relatório gratuito</p>

              <input className="home_input-search" type="text" placeholder="Insira o CEP ou Logradouro" value={searchLocalidade} onChange={(e) => setSearchLocalidade(e.target.value)}/>
              {sugestoes.length > 0 && (
              <div style={{position:'relative', width:550, padding:0}}>
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    top:0,
                    border: "1px solid #ccc",
                    borderRadius:8,
                    background: "#fff",
                    position: "absolute",
                    width: "550px",
                    zIndex: 1000,
                  }}
                >
                  {sugestoes.map((s) => (
                    <li
                      key={s.place_id}
                      onClick={() => {setSearchLocalidade(s.description); setSugestoes([])}}
                      style={{ padding: "8px", cursor: "pointer" }}
                    >
                      {s.description}
                    </li>
                  ))}
                </ul>
                </div>
              )}
              <button className="home_button-search" onClick={()=>consultar()}><Icon path={mdiMagnify} size={1} />Pesquisar</button>
            </div>
        </div>

        <section className="home_secao-1">
          <div className="home_secao-1_title">
            <h1>Conheça a região antes de fechar negócio!</h1>
            <p>Descubra os pontos positivos e negativos do seu novo endereço antes de se mudar</p>
          </div> 


          <div className="home_secao-1_como-funciona">

            <img src={require('../../assets/rua.jpg')} />

            <div className="text-box">
              <h2><Icon path={mdiStarCheck} size={1} /> Evite surpresas!</h2>
              <p className="subtitle">Veja mais sobre os recursos</p>

              <div className="option_text-box">
                <button className="option-button" onClick={()=>{
                  if(!infoCriminalidade){setInfoCriminalidade(true)}else{setInfoCriminalidade(false)}
                }}>
                  <span><Icon path={mdiPoliceBadgeOutline} size={0.75} />Informações de criminalidade</span>
                  {infoCriminalidade ? (
                    <Icon path={mdiChevronUp} size={1} />
                  ):(
                    <Icon path={mdiChevronDown} size={1} />
                  )}                  
                </button>
                {infoCriminalidade && (
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel bibendum odio, ac congue justo. Suspendisse potenti. Praesent nec neque faucibus, sodales velit ut, interdum eros. Maecenas quis pellentesque massa. Phasellus malesuada quam erat, maximus cursus magna efficitur in.</p>
                )}               
              </div>

              <div className="option_text-box">
                <button className="option-button" onClick={()=>{
                  if(!infoOpinioes){setInfoOpinioes(true)}else{setInfoOpinioes(false)}
                }}>
                  <span><Icon path={mdiMessage} size={0.75} />Veja o que moradores dizem</span>
                  {infoOpinioes ? (
                    <Icon path={mdiChevronUp} size={1} color={'#444'}/>
                  ):(
                    <Icon path={mdiChevronDown} size={1} color={'#444'}/>
                  )}                  
                </button>
                {infoOpinioes && (
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel bibendum odio, ac congue justo. Suspendisse potenti. Praesent nec neque faucibus, sodales velit ut, interdum eros. Maecenas quis pellentesque massa. Phasellus malesuada quam erat, maximus cursus magna efficitur in.</p>
                )}               
              </div>

              <div className="option_text-box">
                <button className="option-button" onClick={()=>{
                  if(!infoDadosDemograficos){setInfoDadosDemograficos(true)}else{setInfoDadosDemograficos(false)}
                }}>
                  <span><Icon path={mdiMap} size={1} />Dados demográficos</span>
                  {infoDadosDemograficos ? (
                    <Icon path={mdiChevronUp} size={1} color={'#444'}/>
                  ):(
                    <Icon path={mdiChevronDown} size={1} color={'#444'}/>
                  )}                  
                </button>
                {infoDadosDemograficos && (
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel bibendum odio, ac congue justo. Suspendisse potenti. Praesent nec neque faucibus, sodales velit ut, interdum eros. Maecenas quis pellentesque massa. Phasellus malesuada quam erat, maximus cursus magna efficitur in.</p>
                )}               
              </div>

            </div>
          </div>


          <div className="home_secao-1_planos">
            <div className="home_secao-1_plano-ad">
              <div className="title-box">
                <h1>Gratuito</h1>
                <p>Informações básicas</p>
              </div>
              <div className="price-box">
                <h3>R$<div className="price">0,00</div>/mês</h3>
                <span>Perfeito para testar</span>
                <button>Escolher plano</button>
                <p>Acesso limitado aos recursos</p>
              </div>
              <div className="benefits">
                <h4>Benefícios</h4>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Veja o que dizem da região</p>
                <p><Icon path={mdiCloseCircleOutline} size={0.75} color={'red'}/>Informações de criminalidade</p>
              </div>
            </div>

            <div className="home_secao-1_plano-ad">
              <div className="title-box">
                <h1>Premium</h1>
                <p>Detalhes mais relevantes</p>
              </div>
              <div className="price-box">
                <p>R$ 24,99</p>
                <h3>R$<div className="price">9,99</div>/mês</h3>
                <span>Escolha mais popular</span>
                <button onClick={()=>setCheckoutVisibility(true)}>Escolher plano</button>
                <p>Garanta 48 meses de assinatura por R$ 479,52 (preço normal R$ 1.199,52)</p>
              </div>
              <div className="benefits">
                <h4>Benefícios do Premium</h4>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Veja o que dizem da região</p>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Informações de criminalidade</p>
              </div>
            </div>
          </div>        
        </section>

        <section className="home_secao-2">
            <div className="home_secao-2_title">
              <h1>Avaliações</h1>
              <p>Confira o que dizem sobre o Melocalizaê</p>
            </div> 

            <div className="home_secao-2_carrossel">
              <button onClick={anterior}>
                <Icon path={mdiChevronLeft} size={3} color="#fff" />
              </button>

              <div className="avaliacao">
                <div className="avaliacao_header">
                  <div className="avaliacao_header_info">
                    <h1>{atual.nome}</h1>
                    <p>{atual.data}</p>
                  </div>
                  <div className="avaliacao_header_stars">
                    <Icon path={mdiStar} size={0.8} color={'#fc7b44'}/>
                    <Icon path={mdiStar} size={0.8} color={'#fc7b44'}/>
                    <Icon path={mdiStar} size={0.8} color={'#fc7b44'}/>
                    <Icon path={mdiStar} size={0.8} color={'#fc7b44'}/>
                    <Icon path={mdiStar} size={0.8} color={'#fc7b44'}/>
                  </div>
                </div>
                <p>"{atual.texto}"</p>
              </div>

              <button onClick={proximo}>
                <Icon path={mdiChevronRight} size={3} color="#fff" />
              </button>
            </div>
        </section>

        <section className="home_secao-3">
            <div className="home_secao-3_title">
              <h1>Perguntas frequentes</h1>
              <p>Veja as dúvidas mais comuns dos usuários</p>
            </div>

            <div className="duvidas-list">
                
                <div className="duvida">
                  <div className="duvida_header">
                    <h1>Como funciona o Melocalizaê?</h1>
                    <button onClick={()=>{
                      if(!duvida1){setDuvida1(true)}else{setDuvida1(false)}
                    }}>
                      {duvida1 ? (
                        <Icon path={mdiChevronUp} size={1} color={'#444'}/>
                      ):(
                        <Icon path={mdiChevronDown} size={1} color={'#444'}/>
                      )} 
                    </button>                    
                  </div>
                  {duvida1 && <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel bibendum odio, ac congue justo. Suspendisse potenti. Praesent nec neque faucibus, sodales velit ut, interdum eros. Maecenas quis pellentesque massa. Phasellus malesuada quam erat, maximus cursus magna efficitur in.</p>}
                </div>

                <div className="duvida">
                  <div className="duvida_header">
                    <h1>De onde vêm os dados apresentados nos relatórios?</h1>
                    <button onClick={()=>{
                      if(!duvida2){setDuvida2(true)}else{setDuvida2(false)}
                    }}>
                      {duvida2 ? (
                        <Icon path={mdiChevronUp} size={1} color={'#444'}/>
                      ):(
                        <Icon path={mdiChevronDown} size={1} color={'#444'}/>
                      )} 
                    </button>                    
                  </div>
                  {duvida2 && <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel bibendum odio, ac congue justo. Suspendisse potenti. Praesent nec neque faucibus, sodales velit ut, interdum eros. Maecenas quis pellentesque massa. Phasellus malesuada quam erat, maximus cursus magna efficitur in.</p>}
                </div>

                <div className="duvida">
                  <div className="duvida_header">
                    <h1>Por quanto tempo os relatórios ficam disponíveis?</h1>
                    <button onClick={()=>{
                      if(!duvida3){setDuvida3(true)}else{setDuvida3(false)}
                    }}>
                      {duvida3 ? (
                        <Icon path={mdiChevronUp} size={1} color={'#444'}/>
                      ):(
                        <Icon path={mdiChevronDown} size={1} color={'#444'}/>
                      )} 
                    </button>                    
                  </div>
                  {duvida3 && <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel bibendum odio, ac congue justo. Suspendisse potenti. Praesent nec neque faucibus, sodales velit ut, interdum eros. Maecenas quis pellentesque massa. Phasellus malesuada quam erat, maximus cursus magna efficitur in.</p>}
                </div>

                <div className="duvida">
                  <div className="duvida_header">
                    <h1>Com qual frequência os relatórios são atualizados?</h1>
                    <button onClick={()=>{
                      if(!duvida4){setDuvida4(true)}else{setDuvida4(false)}
                    }}>
                      {duvida4 ? (
                        <Icon path={mdiChevronUp} size={1} color={'#444'}/>
                      ):(
                        <Icon path={mdiChevronDown} size={1} color={'#444'}/>
                      )} 
                    </button>                    
                  </div>
                  {duvida4 && <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel bibendum odio, ac congue justo. Suspendisse potenti. Praesent nec neque faucibus, sodales velit ut, interdum eros. Maecenas quis pellentesque massa. Phasellus malesuada quam erat, maximus cursus magna efficitur in.</p>}
                </div>

            </div> 
        </section>


        {checkoutVisibility && <Checkout></Checkout>}

        <Footer></Footer>
    </div>
    );
}
