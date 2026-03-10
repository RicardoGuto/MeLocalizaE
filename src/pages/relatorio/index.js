import { useEffect, useState, useRef, useMemo, use } from 'react';
import Header from '../components/header';
import './relatorio.css'
import { useLocation } from 'react-router-dom';
import Icon from '@mdi/react';
import Gratuito from './grauito';
import { GoogleMap, Marker, StreetViewPanorama  } from "@react-google-maps/api";
import LoadingRelatorio from '../components/loading_relatorio';
import Indicadores from './indicadores';
import RelatorioPago from './relatorio_pago';
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { mdiMapMarkerRadius } from '@mdi/js';
import Footer from '../components/footer';
import { API_BASE_URL } from '../../global';

const GOOGLE_API = 'AIzaSyCRJnBSTStmvD5-WUr03HCQNHJ44N4Nz5g';

export default function Relatorio({isAuth, setIsAuth}) {

  const location = useLocation();
  const navigate = useNavigate();  
  const [searchParams] = useSearchParams();
  const [resultado, setResultado] = useState(location.state?.resultado)

  const [loadBar, setLoadBar] = useState(0);

    useEffect(() => {
        const verified = localStorage.getItem("verificado");
        const auth = localStorage.getItem("auth");
        if (auth === "false") {
            navigate('/Autenticacao')
        }else if(auth === "true"){
            if(verified === "false"){
              navigate('/EmailVerify')
            }
        }
    }, []);

  const center = useMemo(() => {
    if (!resultado) return null;

    return {
      lat: resultado.geometry.location.lat,
      lng: resultado.geometry.location.lng
    };
  }, [resultado]);

  const endereco = useMemo(() => {
    if (!resultado) return null;

    const components = resultado.address_components;

    return {
      rua: getComponent(components, "route"),
      bairro:
        getComponent(components, "sublocality") ||
        getComponent(components, "political"),
      cidade: getComponent(components, "administrative_area_level_2"),
      estado: getComponent(components, "administrative_area_level_1"),
      latitude: resultado.geometry.location.lat,
      longitude: resultado.geometry.location.lng
    };
  }, [resultado]);

  const [gratuito, setGratuito] = useState(true);

  const [loading, setLoading] = useState(true)
  const mapRef = useRef(null);
  const streetRef = useRef(null);
  const streetInitialized = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  const [cep, setCep] = useState(searchParams.get("cep"));

  
  const [dataRelatorio, setDataRelatorio] = useState({
    pontos_onibus:{total: 0, pontos: []},
    estacoes_metro:{total:0,estacoes:[]},
    terminais_onibus:{total:0,terminais:[]},
    ocorrencias_geo_hidro:{alagamentos: {total:0,ocorrencias:[]},inundacoes: {ocorrencias: [],total:0},deslizamentos: {ocorrencias: [],total: 0},queda_arvore: {ocorrencias: [],total: 0}},
    seguranca_publica:{ocorrencias_default:{ocorrencias:[],ocorrencias_total:0},ocorrencias_12_meses:{ocorrencias:[],ocorrencias_total:0},media_12_meses:0,tipo_ocorrencias:{ocorrencias:[],ocorrencias_distintas:0},bairro: {ocorrencias: [],ocorrencias_total: 0,ocorrencias_12_meses: {ocorrencias: [],ocorrencias_total: 0},media_12_meses: 0,tipo_ocorrencias: {ocorrencias: [],ocorrencias_distintas: 0}}},
    restaurantes:[],
    supermercados:[],
    farmacias:[],
    hospitais:[],
    climaTempo:[]
  });

  const [dadosIndicadores, setDadosIndicadores] = useState({
      pontos_onibus:0,
      terminais_onibus:0,
      estacoes_metro:0,
      seguranca_publica:0,
      restaurantes:0,
      supermercados:0,
      farmacias:0,
      hospitais:0,
      climaTempo:0
  })

  const baseIndicadores = async () => {
    setLoading(true)
      try{
        const response = await fetch(`${API_BASE_URL}/relatorio/calculo-indicadores.php`,{
          method:'POST',
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body:JSON.stringify({
            rua: endereco.rua,
            bairro: endereco.bairro,
            cep: cep,
            estado: endereco.estado,
            cidade: endereco.cidade,
            lat: endereco.latitude,
            lng: endereco.longitude
          })
        })

      const data = await response.json();
      if(data){
        console.log(data)
        setDadosIndicadores(data)
        setLoadBar(60)
      }else{
        console.log("Erro aqui")
      }

    }catch(error){
      setLoading(false)
      console.log(error);
    }
  }

  const relatorioPremium = async () => {
    if (!endereco) {
      setLoading(false);
      return;
    }

    setLoading(true);
    await baseIndicadores();
    try{
      const response = await fetch(`${API_BASE_URL}/relatorio/get_dados_relatorio.php`,{
        method:'POST',
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify({
          rua: endereco.rua,
          bairro: endereco.bairro,
          cep: cep,
          estado: endereco.estado,
          cidade: endereco.cidade,
          lat: endereco.latitude,
          lng: endereco.longitude
        })
      })

      const data = await response.json();
      console.log(data);
      setDataRelatorio(data);
      setLoading(false);
      setLoadBar(100);
    }catch(error){
      setLoading(false)
      console.error(error)
    }
  }

  const verificarAquisicaoRelatorio = async () => {
    setLoading(true)
    try{
      const response = await fetch(`${API_BASE_URL}/relatorio/verificar_aquisicao.php`, {
        method:'POST',
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body:JSON.stringify({
          cep:cep,
        })
      })

      const data = await response.json();
      if(data.status === 'success'){
        if(data.msg === 'Relatório adquirido'){          
          setGratuito(false);
            if (resultado) {
              await relatorioPremium();
              setLoading(false);
              setLoadBar(40)
            }
            
        }else{
          await baseIndicadores();
          setGratuito(true);
          setLoading(false);
        }
      }
    }catch(error){
      console.log(error);
    }
  }

  useEffect(() => {
    if (cep) {
      verificarAquisicaoRelatorio();
    }
  }, [cep]);
  
    
  function getComponent(components, type) {
    const item = components.find(c => c.types.includes(type));
    return item?.long_name || null;
  }

  const consultar = async (cep_param) => {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cep_param)}&components=country:BR&key=${GOOGLE_API}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
          const resultado = data.results[0];  
          
          const estadoComp = resultado.address_components.find(c =>
            c.types.includes("administrative_area_level_1")
          );

          if (estadoComp?.short_name === "SP") {
            setResultado(resultado);
            setLoadBar(20)
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

 useEffect(() => {
    if (resultado) {
      const components = resultado.address_components;
      const cepResultado = getComponent(components, "postal_code");
      if (cepResultado && cepResultado !== cep) {
        setCep(cepResultado);
      }
    }else{
      consultar(cep);
    }
  }, [resultado]);


  useEffect(() => {
    if (!center || !mapReady || !streetRef.current || streetInitialized.current) return;

    streetInitialized.current = true;

    const panorama = new window.google.maps.StreetViewPanorama(
      streetRef.current,
      {
        position: center,
        pov: { heading: 100, pitch: 0 },
        zoom: 1
      }
    );

    mapRef.current.setStreetView(panorama);

  }, [mapReady, center]);


  useEffect(() => {
    if (!gratuito && resultado) {
      relatorioPremium();
    }
  }, [gratuito, resultado]);



  if (!resultado) {
    return <LoadingRelatorio />;
  }


  const components = resultado.address_components;

  const rua = getComponent(components, "route");
  const bairro = getComponent(components, "sublocality") 
              || getComponent(components, "political");
  const cidade = getComponent(components, "administrative_area_level_2");
  const estado = getComponent(components, "administrative_area_level_1");

  const latitude = resultado.geometry.location.lat
  const longitude = resultado.geometry.location.lng
  const zoom =18;
    

  const desbloquearRelatorio = async() => {
      if(!isAuth) return navigate('/Autenticacao')

      try{
      const response = await fetch(`${API_BASE_URL}/relatorio/desbloquear-relatorio.php`, {
        method:'POST',
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body:JSON.stringify({
          cep:cep,
          rua:rua,
          bairro:bairro,
          cidade:cidade
        })
      })
      const data = await response.json();
      if(data.status === 'success'){
        if(data.msg === 'Relatório adquirido com sucesso'){
          setGratuito(false);   
                 
        }else{
          console.log(data.msg)
          setGratuito(true);
          setLoading(false);
        }
      }
    }catch(error){
      console.log(error);
    }
  }
  

  function handleMapLoad(map) {
    mapRef.current = map;
    setMapReady(true);
  }



  



  return (
    <div className="relatorio_body">

      {loading && (<LoadingRelatorio loadBar={loadBar} setLoadBar={setLoadBar}></LoadingRelatorio>)}
      
      <Header isAuth={isAuth} setIsAuth={setIsAuth}/>      
            
      <div className='relatorio_container' id='relatorio_completo' >
        <div className='relatorio_titulo'>
          <h1>Relatório de Ocorrências e Riscos</h1>
          <h2>{rua}</h2>
          <p>{bairro}, {cidade}, {estado}</p>
          <p>{cep}</p>
        </div>


        <div style={{ height: 320, flexDirection:'column', justifyContent:'center', width:'100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #ddd', marginBlock:40 }}>

       

        <GoogleMap
          onLoad={handleMapLoad}
          mapContainerStyle={{ width: "800px", height: "320px" }}
          center={center}
          zoom={zoom}
          options={{
            draggable: false,
            zoomControl: false,
            scrollwheel: false,
            disableDoubleClickZoom: true,
            gestureHandling: "none",
            streetViewControl: false,
          }}
        />

        <div 
          ref={streetRef} 
          style={{
            width: "100%",
            height: "320px",
            marginTop: -320, // sobrepõe o mapa
            pointerEvents: "all" // impede interação indevida
          }}
        />

      </div>
      <p className='micro-legenda' style={{marginTop:0, marginBottom:20, width:'100%', backgroundColor:'#FF6F3311', borderColor:'#FF6F3355', color:'#666'}}><Icon path={mdiMapMarkerRadius} size={1} style={{ verticalAlign:'-3px'}}/> Visualização geográfica do endereço analisado e seu entorno imediato, com base em dados oficiais de localização.</p>

      <Indicadores dadosIndicadores={dadosIndicadores}></Indicadores>
      
      {gratuito && <Gratuito desbloquearRelatorio={desbloquearRelatorio} dadosIndicadores={dadosIndicadores}></Gratuito>}

      {!gratuito && <RelatorioPago dataRelatorio={dataRelatorio} googleAPI={GOOGLE_API} rua={rua} latitude={latitude} longitude={longitude} cidade={cidade}></RelatorioPago>}

      </div>


      <Footer></Footer>
    </div>
  );
}
