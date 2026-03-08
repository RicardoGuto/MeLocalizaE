import { useEffect, useState, useRef, use } from 'react';
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

const GOOGLE_API = 'AIzaSyCRJnBSTStmvD5-WUr03HCQNHJ44N4Nz5g';


export default function Relatorio() {

  
  const location = useLocation();
  const resultado = location.state?.resultado

  const navigate = useNavigate();
  useEffect(()=>{  if (!resultado) {
    navigate('/');
  }},[])


  const components = resultado.address_components;
  const center = {lat:resultado.geometry.location.lat, lng:resultado.geometry.location.lng}

  const [gratuito, setGratuito] = useState(true);
  const [pago, setPago] = useState(true);
  

  const latitude = resultado.geometry.location.lat
  const longitude = resultado.geometry.location.lng
  const zoom =18;

  function getComponent(components, type) {
    const item = components.find(c => c.types.includes(type));
    return item?.long_name || null;
  }

  const cep = getComponent(components, "postal_code");
  const rua = getComponent(components, "route");
  //const numero = getComponent(components, "street_number");
  const bairro = getComponent(components, "sublocality") 
              || getComponent(components, "political");
  const cidade = getComponent(components, "administrative_area_level_2");
  const estado = getComponent(components, "administrative_area_level_1");

  const [loading, setLoading] = useState(true)
  
  const [dataRelatorio, setDataRelatorio] = useState({
    pontos_onibus:{
      total: 0,
      pontos: [],
    },
    estacoes_metro:{
      total:0,
      estacoes:[],
    },
    terminais_onibus:{
      total:0,
      terminais:[],
    },
    ocorrencias_geo_hidro:{
      alagamentos: {
          total:0,
          ocorrencias:[],
      },
      inundacoes: {
          ocorrencias: [],
          total:0
      },
      deslizamentos: {
          ocorrencias: [],
          total: 0
      },
      queda_arvore: {
          ocorrencias: [],
          total: 0
      }
    },
    seguranca_publica:{
      ocorrencias_default:{
        ocorrencias:[],
        ocorrencias_total:0
      },
      ocorrencias_12_meses:{
        ocorrencias:[],
        ocorrencias_total:0
      },
      media_12_meses:0,
      tipo_ocorrencias:{
        ocorrencias:[],
        ocorrencias_distintas:0
      },
      bairro: {
        ocorrencias: [],
        ocorrencias_total: 0,

        ocorrencias_12_meses: {
          ocorrencias: [],
          ocorrencias_total: 0
        },

        media_12_meses: 0,

        tipo_ocorrencias: {
          ocorrencias: [],
          ocorrencias_distintas: 0
        }
      }
    },
    restaurantes:[],
    supermercados:[],
    farmacias:[],
    hospitais:[],
  });

  const desbloquearRelatorio = async() => {
      try{
      const response = await fetch('http://localhost/melocalizae/src/php/relatorio/desbloquear-relatorio.php', {
        method:'POST',
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body:JSON.stringify({
          cep:cep,
        })
      })

      const data = await response.json();
      if(data.status === 'success'){
        if(data.msg === 'Relatório adquirido com sucesso'){
          setGratuito(false);
          window.location.reload(true);
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

  const verificarAquisicaoRelatorio = async () => {
    setLoading(true)
    try{
      const response = await fetch('http://localhost/melocalizae/src/php/relatorio/verificar_aquisicao.php', {
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
          relatorioPremium();
        }else{
          setGratuito(true);
          setLoading(false);
        }
      }
    }catch(error){
      console.log(error);
    }
  }

  const relatorioPremium = async () => {
    setLoading(true)
    try{
      const response = await fetch('http://localhost/melocalizae/src/php/relatorio/get_dados_relatorio.php',{
        method:'POST',
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify({
          rua:rua,
          bairro:bairro,
          cep:cep,
          estado:estado,
          cidade:cidade,
          lat:latitude,
          lng:longitude
        })
      })

      const data = await response.json();
      console.log(data)
      setDataRelatorio(data);
      setLoading(false);
    }catch(error){
      setLoading(false)
      console.error(error)
    }
  }

  useEffect(()=>{
    verificarAquisicaoRelatorio();
  },[])

  const mapRef = useRef(null);
  const streetRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  function handleMapLoad(map) {
    mapRef.current = map;
    setMapReady(true);
  }

  useEffect(() => {
    if (!mapReady || !streetRef.current) return;

    const panorama = new window.google.maps.StreetViewPanorama(
      streetRef.current,
      {
        position: center,
        pov: { heading: 100, pitch: 0 },
        zoom: 1
      }
    );

    mapRef.current.setStreetView(panorama);

    return () => panorama.setVisible(false);
  }, [mapReady]);


 

  return (
    <div className="relatorio_body">

      {loading && (<LoadingRelatorio></LoadingRelatorio>)}
      
      <Header />      
            
      <div className='relatorio_container'>
        <div className='relatorio_titulo'>
          <h1>Relatório de Ocorrências e Riscos</h1>
          <h2>{rua}</h2>
          <p>{bairro}, {cidade}, {estado}</p>
          <p>{cep}</p>
        </div>
        
        <Indicadores></Indicadores>

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

      {gratuito && <Gratuito desbloquearRelatorio={desbloquearRelatorio}></Gratuito>}

      {!gratuito && <RelatorioPago dataRelatorio={dataRelatorio}></RelatorioPago>}

      </div>


      
    </div>
  );
}
