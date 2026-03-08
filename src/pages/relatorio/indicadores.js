import './relatorio.css'
import GaugeComponent from "react-gauge-component";
import { useEffect, useState } from 'react';

export default function Indicadores({dadosIndicadores}) {

  const [indSeguranca, setIndSeguranca] = useState(0);
  const [indInfra, setIndInfra] = useState(0);
  const [indTransporte, setIndTransporte] = useState(0);
  const [indClima, setIndClima] = useState(0);
        
  const [indSegurancaTexto, setIndSegurancaTexto] = useState('');
  const [indInfraTexto, setIndInfraTexto] = useState('');
  const [indTransporteTexto, setIndTransporteTexto] = useState('');
  const [indClimaTexto, setIndClimaTexto] = useState('');

  const calculoIndicadores = async () => { 

    //Segurança
    const seguranca = dadosIndicadores.seguranca_publica
    if(seguranca == 0){
      setIndSeguranca(100);
      setIndSegurancaTexto('Excelente');
    }else if(seguranca < 10 && seguranca > 0){
      setIndSeguranca(90);
      setIndSegurancaTexto('Ótima');
    }else if(seguranca >= 10 && seguranca < 30){
      setIndSeguranca(75);
      setIndSegurancaTexto('Boa');
    }else if(seguranca >= 30 && seguranca > 50){
      setIndSeguranca(50)
      setIndSegurancaTexto('Regular');
    }else if(seguranca >= 50 && seguranca < 100){
      setIndSeguranca(25)
      setIndSegurancaTexto('Ruim');
    }else if(seguranca >= 100){
      setIndSeguranca(0)
      setIndSegurancaTexto('Péssimo');
    }      

    //Infra
    const rTotal = dadosIndicadores.restaurantes;
    const sTotal = dadosIndicadores.supermercados;
    const hTotal = dadosIndicadores.hospitais;
    const fTotal = dadosIndicadores.farmacias;

    if(rTotal + sTotal + hTotal + fTotal === 20){
      setIndInfra(100);
      setIndInfraTexto('Excelente');
    }else if(rTotal + sTotal + hTotal + fTotal >= 15 && hTotal > 0){
      setIndInfra(75);
      setIndInfraTexto('Boa');
    }else if(rTotal + sTotal + hTotal + fTotal >= 10){
      setIndInfra(50);
      setIndInfraTexto('Regular');
    }else if(rTotal + sTotal + hTotal + fTotal <= 10){
      setIndInfra(25);
      setIndInfraTexto('Ruim');
    }else if(rTotal + sTotal + hTotal + fTotal <= 5){
      setIndInfra(25);
      setIndInfraTexto('Péssimo');
    }

    //Transporte
    const pOnibusTotal = dadosIndicadores.pontos_onibus;
    const eMetroTotal = dadosIndicadores.estacoes_metro;
    const tOnibus = dadosIndicadores.terminais_onibus;

    let valor_transporte = 100

    if(pOnibusTotal == 0){valor_transporte = valor_transporte - 50}
    if(eMetroTotal == 0){valor_transporte = valor_transporte - 25}
    if(tOnibus == 0){valor_transporte = valor_transporte - 25}

    if (valor_transporte == 100){setIndTransporteTexto('Excelente'); setIndTransporte(100)}
    if (valor_transporte == 75){setIndTransporteTexto('Bom'); setIndTransporte(75)}
    if (valor_transporte == 50){setIndTransporteTexto('Regular'); setIndTransporte(50)}
    if (valor_transporte == 25){setIndTransporteTexto('Ruim'); setIndTransporte(25)}
    if (valor_transporte == 0){setIndTransporteTexto('Péssimo'); setIndTransporte(0)}

    //Clima
    const media = Math.round(dadosIndicadores.climaTempo);
    console.log(media)
    if(media > 24) {setIndClima(75); setIndClimaTexto('Calor');}
    if(media <= 24 && media >= 18) {setIndClima(50); setIndClimaTexto('Ameno');}
    if(media < 18) {setIndClima(25); setIndClimaTexto('Frio');}

  }

  useEffect(()=>{calculoIndicadores()},[dadosIndicadores])


    return(
      <section className='relatorio_avaliacao_geral' style={{marginBottom:20}}>
          <div className='relatorio_secao_titulo'>
              <h1>Análise geral da localidade</h1>
              <p>Indicadores consolidados que sintetizam os principais fatores de risco e infraestrutura da região.</p>
          </div>

          <div className='score_group'>
            <div className='score-graph'>
              <GaugeComponent
                value={indSeguranca}
                maxValue={100}
                type="semicircle"
                labels={{
                  valueLabel:{hide:true},
                  tickLabels:{hideMinMax:true,
                    defaultTickValueConfig:{hide:true},
                    defaultTickLineConfig:{hide:true}
                  }
                }}
                arc={{
                  width: 0.2,
                  padding: 0.003,
                  cornerRadius:4,
                  gradient: true,
                  subArcs: [
                    {limit: 0, color: '#EA4228',showTick: true},
                    {limit: 50, color: '#F5CD19', showTick: true},
                    {limit: 100, color: '#5BE12C', showTick: false}                      
                  ]
                }}
                pointer={{
                  color: "#575757",
                  length: 0.5,
                  width: 8
                }}
              />
              <h1>{indSegurancaTexto}</h1>
              <h2>Segurança</h2>
            </div>

            <div className='score-graph'>
              <GaugeComponent
                value={indInfra}
                maxValue={100}
                type="semicircle"
                labels={{
                  valueLabel:{hide:true},
                  tickLabels:{hideMinMax:true,
                    defaultTickValueConfig:{hide:true},
                    defaultTickLineConfig:{hide:true}
                  }
                }}
                arc={{
                  width: 0.2,
                  padding: 0.003,
                  cornerRadius:4,
                  gradient: true,
                  subArcs: [
                    {limit: 0, color: '#EA4228',showTick: true},
                    {limit: 50, color: '#F5CD19', showTick: true},
                    {limit: 100, color: '#5BE12C', showTick: false}                      
                  ]
                }}
                pointer={{
                  color: "#575757",
                  length: 0.5,
                  width: 8
                }}
              />
              <h1>{indInfraTexto}</h1>
              <h2>Infraestrutura</h2>
            </div>
            <div className='score-graph'>
              <GaugeComponent
                value={indTransporte}
                maxValue={100}
                type="semicircle"
                labels={{
                  valueLabel:{hide:true},
                  tickLabels:{hideMinMax:true,
                    defaultTickValueConfig:{hide:true},
                    defaultTickLineConfig:{hide:true}
                  }
                }}
                arc={{
                  width: 0.2,
                  padding: 0.003,
                  cornerRadius:4,
                  gradient: true,
                  subArcs: [
                    {limit: 0, color: '#EA4228',showTick: true},
                    {limit: 50, color: '#F5CD19', showTick: true},
                    {limit: 100, color: '#5BE12C', showTick: false}                      
                  ]
                }}
                pointer={{
                  color: "#575757",
                  length: 0.5,
                  width: 8
                }}
              />
              <h1>{indTransporteTexto}</h1>
              <h2>Transporte público</h2>
            </div>
            <div className='score-graph'>
              <GaugeComponent
                value={indClima}
                maxValue={100}
                type="semicircle"
                labels={{
                  valueLabel:{hide:true},
                  tickLabels:{hideMinMax:true,
                    defaultTickValueConfig:{hide:true},
                    defaultTickLineConfig:{hide:true}
                  }
                }}
                arc={{
                  width: 0.2,
                  padding: 0.003,
                  cornerRadius:4,
                  gradient: true,
                  subArcs: [
                    {limit: 0, color: '#2caee1',showTick: true},
                    {limit: 100, color: '#e6380d', showTick: false}                      
                  ]
                }}
                pointer={{
                  color: "#575757",
                  length: 0.5,
                  width: 8
                }}
              />
              <h1>{indClimaTexto}</h1>
              <h2>Clima</h2>
            </div>
          </div>
        </section>
    )
}