import Header from "../components/header";
import './home.css'
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from '@mdi/react';
import { mdiMapSearch, mdiMagnify, mdiCheckCircleOutline, mdiCloseCircleOutline, mdiStarCheck, mdiPoliceBadgeOutline, mdiChevronDown, mdiChevronUp, mdiMessage, mdiMap, mdiChevronLeft, mdiChevronRight, mdiStar, mdiBus } from '@mdi/js';
import Footer from "../components/footer";
import logo_v1 from '../../assets/logo_vetor_v1.png'
import logo_all_white from '../../assets/logo_vetor_v1_all_white.png'
import Checkout from "../components/checkout";
import Popup from "../components/popup";

//SWIPER
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


import imgAssalto from '../../assets/assalto.png'
import imgArvoreCaida from '../../assets/arvore-caida.png'
import imgChuva from '../../assets/chuva.png'
import imgPontoOnibus from '../../assets/ponto-onibus.png'
import imgLocaisProximos from '../../assets/locais-proximos.png'
import LoadingElement from "../components/loading_element";

const GOOGLE_API = 'AIzaSyCRJnBSTStmvD5-WUr03HCQNHJ44N4Nz5g';

const avaliacoes = [
    {
      nome: "Carlos Rodrigues",
      data: "06 de Março de 2026",
      texto:
        "Antes de comprar meu primeiro apartamento eu queria ter certeza de que estava fazendo um bom investimento. O Me localizaê me ajudou a entender melhor a região, principalmente em relação à segurança e infraestrutura ao redor.",
    },
    {
      nome: "Amanda Silva",
      data: "12 de Março de 2026",
      texto:
        "Eu estava me mudando do interior para São Paulo e tinha muito medo de escolher um bairro ruim. Usei o Me localizaê para analisar algumas ruas antes de fechar o contrato do apartamento.",
    },
    {
      nome: "Lucas Pereira",
      data: "15 de Março de 2026",
      texto:
        "Eu e meu marido estávamos procurando uma casa em outra região da cidade e queríamos saber como era a infraestrutura do bairro.",
    },
  ];

export default function Home({isAuth, setIsAuth}) {

    const navigate = useNavigate();
    useEffect(() => {
        const auth = localStorage.getItem("auth");
        const verified = localStorage.getItem("verificado");
        if (auth === "true") {
            console.log("Home: ",verified);
            if(verified === "false"){
              navigate('/EmailVerify')
            }
        }
    }, []);

  const [loadingPesquisar, setLoadingPesquisar] = useState(false);

  const [popup, setPopup] = useState(false);
  const [popupTitulo, setPopupTitulo] = useState('');
  const [popupMensagem, setPopupMensagem] = useState('');
  const [popupOpcoes, setPopupOpcoes] = useState('ok');
  const [popupIcone, setPopupIcone] = useState('erro');

  const [checkoutVisibility, setCheckoutVisibility] = useState(false)

  const [totalRelatorios, setTotalRelatorios] = useState(0);

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
      setLoadingPesquisar(true)
      if(loadingPesquisar) return

      if(searchLocalidade == '') return setLoadingPesquisar(false)
      if(searchLocalidade.length < 8) return setLoadingPesquisar(false)

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchLocalidade)}&components=country:BR&key=${GOOGLE_API}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
          const resultado = data.results[0];  
          
          const estadoComp = resultado.address_components.find(c =>
            c.types.includes("administrative_area_level_1")
          );

          const cepComp = resultado.address_components.find(c =>
            c.types.includes("postal_code")
          );

          const cep = cepComp?.long_name;

          if (estadoComp?.short_name === "SP") {
            sessionStorage.setItem(
              "resultado_relatorio",
              JSON.stringify(resultado)
            );
            navigate(`/Relatorio?cep=${encodeURIComponent(cep)}`, { state: { resultado } })
            setLoadingPesquisar(false)
          }else{
            setPopup(true);
            setPopupTitulo('Região indisponível');
            setPopupIcone('cancel');
            setPopupMensagem('Infelizmente ainda não estamos operando nessa região, mas em breve chegaremos lá para disponibilizar a maior gama de dados possível.')
            setLoadingPesquisar(false);
          }

          
        } else {
          console.error("Erro da API:", data.status);
          setLoadingPesquisar(false)
        }
      } catch (erro) {
        console.error("Erro na requisição:", erro);
        setLoadingPesquisar(false)
      }
  }

  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToPlanos) {
      const el = document.getElementById("planos-melocalizae");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <div>
        <Header isAuth={isAuth} setIsAuth={setIsAuth}/>
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
              <button className="home_button-search" onClick={()=>consultar()}>
              {!loadingPesquisar ? (<><Icon path={mdiMagnify} size={1} /> Pesquisar</>) : <LoadingElement color={"#fff"} size={1}></LoadingElement>}</button>
            </div>
        </div>

        <section className="home_secao-1">
          <div className="home_secao-1_title">
            <h1>Conheça a região antes de fechar negócio!</h1>
            <p>Descubra os pontos positivos e negativos do seu novo endereço antes de se mudar</p>
          </div> 

              <Swiper
                className="swiper-main"
                modules={[Navigation, Pagination, Autoplay]}
                navigation={false}
                spaceBetween={30}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{ delay: 10000 }}
                loop={true}
                style={{ width: "100%", maxWidth: "800px", paddingBottom: "50px" }}
              >
                <SwiperSlide>
                  <div className="swiper-slide">
                    <img src={imgAssalto} />
                    <h2>Informações de criminalidade</h2>
                    <p>
                      Descubra quantas e quais ocorrências foram registradas exatamente no endereço dentro do último ano. Veja indicadores gráficos históricos que apresentam os períodos de maior frequência de crimes. Também tenha acesso à informações de periculosidade nas imediações do endereço.
                    </p>
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="swiper-slide">
                    <img src={imgPontoOnibus} />
                    <h2>Mobilidade e Trânsito</h2>
                    <p>
                      Informativos da disponibilidade e acesso a modais de transporte público no entorno do endereço analisado. Também veja o tempo de deslocamento até pontos de referência mais procurados.
                    </p>
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="swiper-slide">
                    <img src={imgChuva} />
                    <h2>Histórico de clima</h2>
                    <p>
                      Acompanhe a evolução climática com registros históricos de temperatura e pluvialidade da região.
                    </p>
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="swiper-slide">
                    <img src={imgArvoreCaida} />
                    <h2>Desastres Naturais</h2>
                    <p>
                      Veja registros históricos de quedas de árvore, deslizamentos, alagamentos e inudanções no endereço.
                    </p>
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="swiper-slide">
                    <img src={imgLocaisProximos} />
                    <h2>Locais próximos</h2>
                    <p>
                      Descubra quais os restaurantes, supermercados, farmácias e hospitais próximos do endereço
                    </p>
                  </div>
                </SwiperSlide>
              </Swiper>

          <div className="home_secao-1_como-funciona" id="planos-melocalizae">

            <div className="text-box">
              <h2><Icon path={mdiStarCheck} size={1} /> Evite surpresas!</h2>
              <p className="subtitle">Descubra como a Me localizaÊ pode te ajudar na hora de escolher onde morar!</p>           

            </div>
          </div>


          <div className="home_secao-1_planos" >
            <div className="home_secao-1_plano-ad">
              <div className="title-box">
                <h1>Gratuito</h1>
                <p>Informações básicas</p>
              </div>
              <div className="price-box">
                <h3>R$<div className="price">0,00</div>/mês</h3>
                <span>Perfeito para testar</span>
                <button onClick={()=>{ window.scrollTo({ top: 0, behavior: "smooth" })}}>Faça sua pesquisa!</button>
                <p>Acesso limitado aos recursos</p>
              </div>
              <div className="benefits">
                <h4>Benefícios</h4>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Indicadores simplificados</p>
                <p><Icon path={mdiCloseCircleOutline} size={0.75} color={'red'}/>Informações de criminalidade</p>
                <p><Icon path={mdiCloseCircleOutline} size={0.75} color={'red'}/>Clima e tempo da região</p>
                <p><Icon path={mdiCloseCircleOutline} size={0.75} color={'red'}/>Mobilidade e transporte</p>
                <p><Icon path={mdiCloseCircleOutline} size={0.75} color={'red'}/>Desastres naturais</p>
                <p><Icon path={mdiCloseCircleOutline} size={0.75} color={'red'}/>Pontos de interesse próximos</p>
              </div>
            </div>

            <div className="home_secao-1_plano-ad">
              <div className="title-box">
                <h1>1 Relatório</h1>
                <p>Detalhes mais relevantes</p>
              </div>
              <div className="price-box">
                <p><br></br></p>
                <h3>R$<div className="price">11,99</div>/mês</h3>
                <span>Escolha mais popular</span>
                <button onClick={()=>{
                  if(!isAuth) return navigate('/Autenticacao')
                  setCheckoutVisibility(true);setTotalRelatorios(1)
                  }}>Escolher</button>
                <p>Após a compra você receberá um crédito em sua conta</p>
              </div>
              <div className="benefits">
                <h4>Benefícios do Premium</h4>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Indicadores simplificados</p>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Informações de criminalidade</p>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Clima e tempo da região</p>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Mobilidade e transporte</p>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Desastres naturais</p>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Pontos de interesse próximos</p>
              </div>
            </div>

            <div className="home_secao-1_plano-ad">
              <div className="title-box">
                <h1>5 Relatórios</h1>
                <p>Detalhes mais relevantes</p>
              </div>
              <div className="price-box">
                <p>R$ 59,95</p>
                <h3>R$<div className="price">53,99</div>/mês</h3>
                <span>Escolha mais econômica</span>
                <button onClick={()=>{

                  if(!isAuth) return navigate('/Autenticacao')
                  setCheckoutVisibility(true);setTotalRelatorios(5)

                }}>Escolher</button>
                <p>Após a compra você receberá cinco créditos em sua conta</p>
              </div>
              <div className="benefits">
                <h4>Benefícios do Premium</h4>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Indicadores simplificados</p>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Informações de criminalidade</p>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Clima e tempo da região</p>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Mobilidade e transporte</p>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Desastres naturais</p>
                <p><Icon path={mdiCheckCircleOutline} size={0.75} color={'green'}/>Pontos de interesse próximos</p>
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
                  {duvida1 && <p>Pesquise por um endereço de interesse e tenha acesso ao relatório gratuito da localidade. A partir disso, você pode utilizar créditos para desbloquear o relatório premium e ter acesso à informações muito mais detalhadas! Lembre-se: Você desbloqueia sempre o CEP da região!</p>}
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
                  {duvida2 && <p>Os dados são de bases distintas das prefeituras e governos de cada estado ativo. Também são utilizadas bases oficiais de mapas e clima para disponibilizar informativos precisos.</p>}
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
                  {duvida3 && <p>Uma vez desbloqueado, o relatório do CEP fica disponível de forma vitalícia, sempre atualizado. Não é necessário desbloquear de novo para atualizar informações!</p>}
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
                  {duvida4 && <p>A base de dados do relatório é atualizada na mesma frequência que os orgãos governamentais disponibilizam novos dados. Esse período pode variar entre uma vez por semana à uma vez por mês.</p>}
                </div>

            </div> 
        </section>


        {checkoutVisibility && <Checkout checkoutVisibility={checkoutVisibility} setCheckoutVisibility={setCheckoutVisibility} totalRelatorios={totalRelatorios} isAuth={isAuth} setIsAuth={setIsAuth}></Checkout>}

        <Footer></Footer>
        <Popup titulo={popupTitulo} mensagem={popupMensagem} opcoes={popupOpcoes} icone={popupIcone} setPopup={setPopup} popup={popup}></Popup>
    </div>
    );
}
