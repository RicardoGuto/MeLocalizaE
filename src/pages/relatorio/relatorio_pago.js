import './relatorio.css'

import Icon from '@mdi/react';
import { mdiBusMarker, mdiCalculator, mdiCalendar, mdiCar, mdiCarArrowRight, mdiCarEmergency, mdiChevronDoubleDown, mdiClock, mdiClockOutline, mdiCloud, mdiHelpCircleOutline, mdiMapMarkerDistance, mdiMapMarkerOutline, mdiMapMarkerRadius, mdiMapMarkerRadiusOutline, mdiRobber, mdiSubway, mdiSubwayVariant, mdiSunAngle, mdiSunWireless, mdiTerrain, mdiTrain, mdiTree,  mdiTreeOutline,  mdiWaterAlertOutline, mdiWaveArrowUp, mdiWeatherRainy, mdiWeatherSunny } from '@mdi/js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LineChart, Line, Legend, } from "recharts";
import { useEffect, useState } from 'react';
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import aparecidaIMG from './img/aparecida.jpg'
import santosIMG from './img/santos.webp'
import camposJordaoIMG from './img/camposJordao.jpg'
import seIMG from './img/se.jpg'

export default function RelatorioPago({dataRelatorio, googleAPI, rua, latitude, longitude, cidade}){

     //Gráfico
    const dados = dataRelatorio.seguranca_publica.tipo_ocorrencias.ocorrencias;
    const alturaGrafico = Math.max(dados.length * 80, 120);

    const redColors = [
    "#7A0C0C", "#8E1616", "#A11B1B", "#B32020", "#C12727", "#CE2E2E", "#DB3636", "#E13F3F", "#E84848", "#EE5252", 
    "#F45C5C", "#F96666", "#FC7070", "#FF7A7A", "#FF8A8A", "#FF9B9B", "#FFADAD",   "#FFC0C0" ];

    function prepararEvolucaoUltimos12Meses(geral, bairro) {
        const agora = new Date();
        const mapa = {};

        // 1) Inicializa últimos 12 meses
        for (let i = 11; i >= 0; i--) {
            const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
            const ano = d.getFullYear();
            const mes = String(d.getMonth() + 1).padStart(2, '0');
            const chave = `${ano}-${mes}`;

            const mesLabel = d
                .toLocaleString('pt-BR', { month: 'short' })
                .replace('.', '') + '/' + String(ano).slice(-2);

            mapa[chave] = {
                mes: mesLabel,
                total_geral: 0,
                total_bairro: 0
            };
        }

        // 2) Soma ocorrências gerais
        geral?.ocorrencias?.forEach(item => {
            if (!item.DATA_OCORRENCIA_BO) return;

            const [, mes, ano] = item.DATA_OCORRENCIA_BO.split('/');
            const chave = `${ano}-${mes.padStart(2, '0')}`;

            if (mapa[chave]) {
                mapa[chave].total_geral++;
            }
        });

        // 3) Soma ocorrências do bairro
        bairro?.ocorrencias?.forEach(item => {
            if (!item.DATA_OCORRENCIA_BO) return;

            const [, mes, ano] = item.DATA_OCORRENCIA_BO.split('/');
            const chave = `${ano}-${mes.padStart(2, '0')}`;

            if (mapa[chave]) {
                mapa[chave].total_bairro++;
            }
        });

        // 4) Retorno ordenado
        return Object.keys(mapa)
            .sort()
            .map(chave => mapa[chave]);
    }

    const dadosEvolucao = prepararEvolucaoUltimos12Meses(
        dataRelatorio.seguranca_publica.ocorrencias_12_meses,
        dataRelatorio.seguranca_publica.bairro.ocorrencias_12_meses
    );
    function titleCase(str) {
        if (!str) return "";
        const fixed = str.replace(/([^\s])\-([^\s])/g, "$1 - $2");

        return fixed
        .toLowerCase()
        .split(" ")
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
    }


    const dadosClima = prepararClimaUltimos12Meses(
        dataRelatorio.climaTempo
    );


    function prepararClimaUltimos12Meses(clima) {
        const mapa = {};

        Object.keys(clima).forEach(data => {
            const mesKey = data.slice(0, 7);

            if (!mapa[mesKey]) {
                mapa[mesKey] = {
                    mesKey,
                    tempMax: 0,
                    tempMin: 0,
                    chuva: 0,
                    count: 0
                };
            }

            mapa[mesKey].tempMax += clima[data].temp_max;
            mapa[mesKey].tempMin += clima[data].temp_min;
            mapa[mesKey].chuva += clima[data].chuva_mm;
            mapa[mesKey].count++;
        });

        return Object.values(mapa)
            .sort((a, b) => a.mesKey.localeCompare(b.mesKey))
            .map(m => {
                const d = new Date(m.mesKey + '-01');
                const mes = d
                .toLocaleString('pt-BR', { month: 'short' })
                .replace('.', '');

                return {
                    mes: `${mes}/${String(d.getFullYear()).slice(-2)}`,
                    tempMax: Number((m.tempMax / m.count).toFixed(1)),
                    tempMin: Number((m.tempMin / m.count).toFixed(1)),
                    chuva: Number(m.chuva.toFixed(1))
                };
            });
    }

function prepararIndicePericulosidadePorHora(ocorrencias) {
    const mapa = {};

    for (let h = 0; h < 24; h++) {
        const hora = String(h).padStart(2, '0');
        mapa[hora] = {
            horaNum: h,
            hora: `${hora}h`,
            total: 0
        };
    }

    ocorrencias.forEach(item => {
        if (!item.HORA_OCORRENCIA_BO) return;

        const hora = item.HORA_OCORRENCIA_BO.slice(0, 2);
        if (mapa[hora]) {
            mapa[hora].total++;
        }
    });

    return Object.values(mapa)
        .sort((a, b) => a.horaNum - b.horaNum); // ✅ ordem correta
}

    const dadosPericulosidadeHora = prepararIndicePericulosidadePorHora(
        dataRelatorio.seguranca_publica.ocorrencias_default.ocorrencias
    );

    
    

    const tempoDeslocamento = async () => {
        const destinos = [
            "Campos do Jordão, SP, Brasil",
            "Praça da Sé, São Paulo, SP, Brasil",
            "Santos, SP, Brasil",
            "Aparecida, SP, Brasil"
        ];

        try {
            const resultados = await Promise.all(
                destinos.map(async (destino) => {

                    const response = await fetch(
                        "https://routes.googleapis.com/directions/v2:computeRoutes",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-Goog-Api-Key": googleAPI,
                                "X-Goog-FieldMask": "routes.duration,routes.distanceMeters"
                            },
                            body: JSON.stringify({
                                origin: {
                                    location: {
                                        latLng: {
                                            latitude: latitude,
                                            longitude: longitude
                                        }
                                    }
                                },
                                destination: {
                                    address: destino
                                },
                                travelMode: "DRIVE",
                                routingPreference: "TRAFFIC_AWARE",
                                computeAlternativeRoutes: false
                            })
                        }
                    );

                    const data = await response.json();

                    if (!data.routes || !data.routes.length) {
                        return {
                            destino,
                            tempo: null,
                            distancia: null
                        };
                    }

                    const rota = data.routes[0];

                    const duracaoSegundos = parseInt(rota.duration.replace("s", ""));
                    const minutos = Math.round(duracaoSegundos / 60);
                    const km = (rota.distanceMeters / 1000).toFixed(1);

                    return {
                        destino,
                        tempoMinutos: minutos,
                        distanciaKm: km
                    };
                })
            );
            console.log(resultados);
            return resultados;
        } catch (error) {
            console.error("Erro ao calcular rotas:", error);
        }
    };

    const [distancias, setDistancias] = useState([
        { destino: "", tempoMinutos: 0, distanciaKm: "" },
        { destino: "", tempoMinutos: 0, distanciaKm: "" },
        { destino: "", tempoMinutos: 0, distanciaKm: "" },
        { destino: "", tempoMinutos: 0, distanciaKm: "" },
    ]);

    useEffect(() => {
        const carregarDistancias = async () => {
            const resultado = await tempoDeslocamento();
            setDistancias(resultado);
        };

        carregarDistancias();
    }, []);

    

    return(
        <div className='relatorioPago'>
          
            <div className='section-separator'></div>

            <section className='relatorio_seguranca'>
                <div className='relatorio_secao_titulo'>
                    <h1>Detalhamento de segurança</h1>
                    <p>Fonte: Secretaria de Segurança Pública - </p>
                </div>
                    
                <div className='relatorio_principais-ocorrencias' >                    
                    <div className='colunas-cards'>
                        <div className='group-column-cards group-cards'>
                        <h1 className='title'>Ocorrências no logradouro</h1>
                        <p className='subtitle'><Icon path={mdiMapMarkerOutline} size={1} />Registros do endereço</p>
                        <div className='card' style={{backgroundColor:'#690000'}}>
                            <div className='card_content'>
                            <h1>{dataRelatorio.seguranca_publica.ocorrencias_default.ocorrencias_total}</h1>
                            <h2>Ocorrências totais</h2>
                            </div>
                            <Icon path={mdiCarEmergency} size={1.5} color={'#fff'}/>
                        </div>
        
                        <div className='card' style={{backgroundColor:'#8a1a18'}}>
                            <div className='card_content'>
                            <h1>{dataRelatorio.seguranca_publica.ocorrencias_12_meses.ocorrencias_total}</h1>
                            <h2>Ocorrências nos últimos 12 meses</h2>
                            </div>
                            <Icon path={mdiRobber} size={1.5} color={'#fff'}/>
                        </div>
        
                        <div className='card' style={{backgroundColor:'#ac302c'}}>
                            <div className='card_content'>
                            <h1>{dataRelatorio.seguranca_publica.media_12_meses}</h1>
                            <h2>Média de ocorrências ao mês em 12 meses</h2>
                            </div>
                            <Icon path={mdiCalculator} size={1.5} color={'#fff'}/>
                        </div>
                        </div>
        
                        <div className='group-column-cards group-cards'> 
                        <h1 className='title'>Ocorrências nas imediações</h1>
                        <p className='subtitle'><Icon path={mdiMapMarkerRadiusOutline} size={1} />Raio de 1 Km</p> 
                        <div className='card' style={{backgroundColor:'#690000'}}>
                            <div className='card_content'>
                            <h1>{dataRelatorio.seguranca_publica.bairro.ocorrencias_total}</h1>
                            <h2>Ocorrências totais</h2>
                            </div>
                            <Icon path={mdiCarEmergency} size={1.5} color={'#fff'}/>
                        </div>
        
                        <div className='card' style={{backgroundColor:'#8a1a18'}}>
                            <div className='card_content'>
                            <h1>{dataRelatorio.seguranca_publica.bairro.ocorrencias_12_meses.ocorrencias_total}</h1>
                            <h2>Ocorrências nos últimos 12 meses</h2>
                            </div>
                            <Icon path={mdiRobber} size={1.5} color={'#fff'}/>
                        </div>
        
                        <div className='card' style={{backgroundColor:'#ac302c'}}>
                            <div className='card_content'>
                            <h1>{dataRelatorio.seguranca_publica.bairro.media_12_meses}</h1>
                            <h2>Média de ocorrências ao mês em 12 meses</h2>
                            </div>
                            <Icon path={mdiCalculator} size={1.5} color={'#fff'}/>
                        </div>
                        </div>                        
                    </div>
                
                    <p className='micro-legenda' style={{backgroundColor:'#AC302C11', borderColor:'#AC302C55', color:'#666'}}>
                        <span style={{fontWeight:'bold'}}><Icon path={mdiHelpCircleOutline} size={0.7} style={{ verticalAlign:'-3px'}} /> O que são essas informações?</span>
                        <br></br>
                        Registros de ocorrências diretamente associadas ao endereço analisado e em um raio de até 1km do endereço analisado, considerando os últimos 12 meses.</p>        
                    </div>  

                    
                      
                    <div className='grafico_ssp' style={{ width: "100%", display: "flex", flexDirection: "column",alignItems: "center" }}>
                        <h1 className='title'>Últimos 12 meses</h1>
                        <p className='subtitle'><Icon path={mdiCalendar} size={1} />Ocorrências registradas no último ano</p>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={dadosEvolucao}
                                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="mes"
                                    interval={0}
                                    tick={{ fontSize: 14 }}
                                />

                                <YAxis allowDecimals={false} />

                                <Tooltip
                                    formatter={(valor, nome) => [
                                        `${valor} ocorrências`,
                                        nome === 'total_geral' ? 'Geral' : 'Bairro'
                                    ]}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="total_bairro"
                                    name="Bairro"
                                    stroke="#661010"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="total_geral"
                                    name="Geral"
                                    stroke="#b30000"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />


                            </LineChart>
                        </ResponsiveContainer>
                        
                        <p className='micro-legenda' style={{width:'100%', backgroundColor:'#AC302C11', borderColor:'#AC302C55', color:'#666'}}>
                            <span style={{fontWeight:'bold'}}><Icon path={mdiHelpCircleOutline} size={0.7} style={{ verticalAlign:'-3px'}} /> O que diz o gráfico?</span>
                            <br></br>
                            Evolução temporal das ocorrências registradas, permitindo identificar tendências recentes de segurança.</p>       
                        
                    </div>  

                    <div className='grafico_ssp' style={{ width: "100%", display: "flex", flexDirection: "column",alignItems: "center" }}>
                        <h1 className='title'>Principais ocorrências</h1>
                        <p className='subtitle'><Icon path={mdiCarEmergency} size={1} />Saiba as ocorrências mais comuns na região</p>
                        <ResponsiveContainer  height={alturaGrafico}>
                        <BarChart
                            data={dados}
                            layout="vertical"
                            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                            barCategoryGap={20}
                        >
                            <YAxis
                            dataKey="NATUREZA_APURADA"
                            type="category"
                            width={'auto'}
                            tickFormatter={(valor) =>
                                valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase()
                            }
                            tick={{
                                fontSize: 18,
                                fontFamily: "Nunito, sans-serif",
                                fill: "#666",
                                fontWeight:'bold'
                            }}
                            />
        
                            <XAxis
                            type="number"
                            domain={[0, (dataMax) => Math.ceil(dataMax * 1.1)]}
                            allowDecimals={false}
                            />
        
                            <CartesianGrid strokeDasharray="2 2" />
        
                            <Tooltip
                            formatter={(valor) => [`${valor} ocorrências`, "Total"]}
                            contentStyle={{
                                background: "#fcfcfc",
                                borderRadius: "8px",
                                border: "1px solid #eee",
                            }}
                            />
        
                            <Bar dataKey="total" barSize={22} radius={[0, 6, 6, 0]}>
                            {dados.map((entry, index) => (
                                <Cell key={index} fill={redColors[index % redColors.length]} />
                            ))}
                            </Bar>
                        </BarChart>
                        </ResponsiveContainer>

                         <p className='micro-legenda' style={{width:'100%', backgroundColor:'#AC302C11', borderColor:'#AC302C55', color:'#666'}}>
                            <span style={{fontWeight:'bold'}}><Icon path={mdiHelpCircleOutline} size={0.7} style={{ verticalAlign:'-3px'}} /> O que diz o gráfico?</span>
                            <br></br>
                            Distribuição dos tipos de ocorrências mais frequentes registradas na região analisada.</p>       
                    </div>  

                    <div className='grafico_ssp' style={{ width: "100%", display: "flex", flexDirection: "column",alignItems: "center" }}><h1 className='title'>Índice de periculosidade por horário</h1>
                        <p className='subtitle'><Icon path={mdiClockOutline} size={1} />*Apenas dados que o horário foi efetivamente registrado</p>

                                    
                        <div style={{ width: '100%', height: 320, marginTop: 40 }}>
                            <ResponsiveContainer>
                                <BarChart data={dadosPericulosidadeHora}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hora" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />

                                    <Bar
                                        dataKey="total"
                                        name="Ocorrências"
                                        fill="#C0392B"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <p className='micro-legenda' style={{width:'100%', backgroundColor:'#AC302C11', borderColor:'#AC302C55', color:'#666'}}>
                            <span style={{fontWeight:'bold'}}><Icon path={mdiHelpCircleOutline} size={0.7} style={{ verticalAlign:'-3px'}} /> O que diz o gráfico?</span>
                            <br></br>
                            Concentração de ocorrências por faixa horária, considerando apenas registros com horário efetivamente identificado.
                        </p>   
                    </div>                
                </section>
        
                <div className='section-separator'></div>

                <section className='relatorio_clima_tempo' style={{marginTop:40}}>
                    <div className='relatorio_secao_titulo'>
                        <h1>Meio ambiente</h1>
                        <p>Histórico de clima e desastres naturais</p>
                    </div>

                    <h1 className='title'>Histórico de clima - Temperatura</h1>
                    <p className='subtitle'><Icon path={mdiWeatherSunny} size={1} />Confira o histórico de temperatura média no último ano</p>
                    <div style={{ width: '100%', height: 500, marginTop: 40 }}>
                        <ResponsiveContainer>
                            <LineChart data={dadosClima}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis yAxisId="temp" unit="°C" />
                                <YAxis
                                    yAxisId="chuva"
                                    orientation="right"
                                    unit="mm"
                                />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="temp"
                                    type="monotone"
                                    dataKey="tempMin"
                                    name="Temp. mínima (°C)"
                                    stroke="#0077ff"
                                />

                                <Line
                                    yAxisId="temp"
                                    type="monotone"
                                    dataKey="tempMax"
                                    name="Temp. máxima (°C)"
                                    stroke="#ff0044"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className='micro-legenda' style={{backgroundColor:'#ff205b11', borderColor:'#ff205b55', color:'#666'}}>                     
                        <span style={{fontWeight:'bold'}}><Icon path={mdiHelpCircleOutline} size={0.7} style={{ verticalAlign:'-3px'}} /> O que diz o gráfico?</span>
                        <br></br>
                        Variação mensal das temperaturas médias máximas e mínimas registradas nos últimos 12 meses.
                    </p>
                    <br></br>
                    <h1 className='title'>Histórico de chuvas</h1>
                    <p className='subtitle'><Icon path={mdiWeatherRainy} size={1} />Confira o índice pluviométrico da região no último ano</p>

                    <div style={{ width: '100%', height: 360, marginTop: 40 }}>
                        <ResponsiveContainer>
                            <BarChart data={dadosClima}>
                                <CartesianGrid strokeDasharray="3 3"/>

                                <XAxis dataKey="mes"/>

                                <YAxis
                                    yAxisId="chuva"
                                    unit="mm"
                                />

                                <Tooltip />
                                <Legend />

                                <Bar                                    
                                    yAxisId="chuva"
                                    dataKey="chuva"
                                    name="Chuva (mm)"
                                    background="#4A90E2"
                                    fill='#77b3f8'
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className='micro-legenda' style={{backgroundColor:'#77B3F811', borderColor:'#77B3F855', color:'#666'}}>
                        <span style={{fontWeight:'bold'}}><Icon path={mdiHelpCircleOutline} size={0.7} style={{ verticalAlign:'-3px'}} /> O que diz o gráfico?</span>
                        <br></br>
                        Cada 1 mm de chuva equivale a 1 litro de água acumulado em 1 m². O gráfico apresenta o volume mensal de precipitação registrado na região nos últimos 12 meses.</p>
                </section>



               {cidade === "São Paulo" && <section className='relatorio_geologico'>
                    <h1 className='title'>Desastres naturais</h1>
                    <p className='subtitle'><Icon path={mdiTreeOutline} size={1} />Registros oficiais de eventos ambientais reportados na região durante o período analisado.</p>
                    <div className='relatorio_principais-ocorrencias'>
                    <div className='group-line-cards group-cards'>              
                        
                        <div className='card' style={{backgroundColor:'#6a9eda'}}>
                        <div className='card_content'>
                            <h1>{dataRelatorio.ocorrencias_geo_hidro.alagamentos.total}</h1>
                            <h2>Alagamentos</h2>
                        </div>
                        <Icon path={mdiWaterAlertOutline} size={1.5} color={'#fff'}/>
                        </div>
        
                        <div className='card' style={{backgroundColor:'#5086c1'}}>
                        <div className='card_content'>
                            <h1>{dataRelatorio.ocorrencias_geo_hidro.inundacoes.total}</h1>
                            <h2>Inundações</h2>
                        </div>
                        <Icon path={mdiWaveArrowUp} size={1.5} color={'#fff'}/>
                        </div>
        
                        <div className='card' style={{backgroundColor:'#bf9780'}}>
                        <div className='card_content'>
                            <h1>{dataRelatorio.ocorrencias_geo_hidro.deslizamentos.total}</h1>
                            <h2>Deslizamentos</h2>
                        </div>
                        <Icon path={mdiTerrain} size={1.5} color={'#fff'} />
                        </div>
        
                        <div className='card' style={{backgroundColor:'#a68069'}}>
                        <div className='card_content'>
                            <h1>{dataRelatorio.ocorrencias_geo_hidro.queda_arvore.total}</h1>
                            <h2>Quedas de árvores</h2>
                        </div>
                        <Icon path={mdiTree}size={1.5} color={'#fff'} />
                        </div>
                    </div>            
                    </div>        
                </section>}

                <div className='section-separator'></div>

                <section className='relatorio_geologico'>
                    <div className='relatorio_secao_titulo'>
                        <h1>Mobilidade e Trânsito</h1>
                        <p>Disponibilidade e acesso a modais de transporte público no entorno do endereço analisado.</p>
                    </div>
                    <h1 className='title'>Transporte Público</h1>
                    <p className='subtitle'><Icon path={mdiTreeOutline} size={1} />Disponibilidade e acesso a modais de transporte público no entorno do endereço analisado.</p>
                    <div className='relatorio_transporte'>
                        <div className='group-line-cards group-cards'>             
                            <div className='card' style={{backgroundColor:'#004400',width:"calc(33%)"}}>
                            <div className='card_content'>
                                <h1>{dataRelatorio.pontos_onibus.total}</h1>
                                <h2>Pontos de Ônibus dentro de 1 Km</h2>
                            </div>
                            <Icon path={mdiBusMarker} size={1.5} color={'#fff'}/>
                            </div>
            
                            <div className='card' style={{backgroundColor:'#136015', width:"calc(33%)"}}>
                            <div className='card_content'>
                                <h1>{dataRelatorio.terminais_onibus.total}</h1>
                                <h2>Terminais de ônibus dentro de 5 Km</h2>
                            </div>                
                            <Icon path={mdiTrain} size={1.5} color={'#fff'}/>
                            </div>
            
                            <div className='card' style={{backgroundColor:'#267d29', width:"calc(33%)"}}>
                            <div className='card_content'>
                                <h1>{dataRelatorio.estacoes_metro.total}</h1>
                                <h2>Estações de metrô dentro de 3 Km</h2>
                            </div>                
                            <Icon path={mdiSubway} size={1.5} color={'#fff'}/>                
                            </div>
                            
                        </div>            
                        <div className='group-column-cards group-cards'>            
                            
                            <div className='card' style={{backgroundColor:'#399b3e', width:'100%'}}>
                            <div className='card_content'>
                                <h1>{titleCase(dataRelatorio?.pontos_onibus?.pontos[0]?.pt_nome ?? "Nenhum disponível")}</h1>
                                <h2>Ponto de Ônibus mais próximo</h2>
                            </div>
                            <Icon path={mdiBusMarker} size={1.5} color={'#fff'}/>
                            </div>
            
                            <div className='card' style={{backgroundColor:'#55b758', width:'100%'}}>
                            <div className='card_content'>
                                <h1>{titleCase(dataRelatorio?.terminais_onibus?.terminais[0]?.nome ?? "Nenhum disponível")}</h1>
                                <h2>Terminal de ônibus mais próximo</h2>
                            </div>
                            <Icon path={mdiSubwayVariant} size={1.5} color={'#fff'}/>
                            </div>
            
                            <div className='card' style={{backgroundColor:'#78cf77', width:'100%'}}>
                            <div className='card_content'>
                                <h1>{titleCase(dataRelatorio?.estacoes_metro?.estacoes[0]?.emt_nome ?? "Nenhum disponível")}</h1>
                                <h2>Estação de metrô mais próxima</h2>
                            </div>
                            <Icon path={mdiTrain} size={1.5} color={'#fff'}/>
                            </div>                            
                        </div>            
                    </div>   
                <p className='micro-legenda' style={{marginTop:20, marginBottom:0, width:'100%', backgroundColor:'#399B3E11', borderColor:'#399B3E55', color:'#666'}}>
                    <span style={{fontWeight:'bold'}}><Icon path={mdiHelpCircleOutline} size={0.7} style={{ verticalAlign:'-3px'}} /> O que são essas informações?</span>
                    <br></br>
                    O detalhamento representa a infraestrutura de transporte público da região
                </p> 

                <div className='relatorio_distancias'>
                    <h1 className='title'>Mobilidade</h1>
                    <p className='subtitle'><Icon path={mdiCar} size={1} />Tempo médio de deslocamento entre a região e pontos de referência</p>


                    <div className='relatorio_distancias_cards'>

                        <div className='distancia_card'>
                            <h1>Aparecida</h1>
                            <h2>São Paulo - Interior</h2>
                            <img className='cityPicture' src={aparecidaIMG}></img>
                            <div className='distancia_card_info'>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <p><span style={{fontWeight:'bold'}}>Partida:</span> {rua}</p>
                                    <Icon path={mdiChevronDoubleDown} size={1.5} color={'#fc7b44'}/>
                                    <p><span style={{fontWeight:'bold'}}>Destino:</span> Aparecida, SP</p>
                                </div>
                               
                                <div style={{display:'flex', flexDirection:'column', alignItems:'start', justifyContent:'space-between', gap:10}}>
                                    <div className='distancia_card_tempo_desloc'>
                                        <Icon path={mdiCarArrowRight} size={1.25} />
                                        <h3>{JSON.stringify(distancias[3].tempoMinutos)} min</h3>
                                    </div>
                                    <div className='distancia_card_tempo_desloc'>
                                        <Icon path={mdiMapMarkerDistance} size={1.25} />
                                        <h3>{Math.round(distancias[3].distanciaKm)} Km</h3>
                                    </div>
                                </div>                                
                                
                            </div>
                        </div>

                        <div className='distancia_card'>
                            <h1>Campos do Jordão</h1>
                            <h2>São Paulo - Interior</h2>
                            <img className='cityPicture' src={camposJordaoIMG}></img>
                            <div className='distancia_card_info'>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <p><span style={{fontWeight:'bold'}}>Partida:</span> {rua}</p>
                                    <Icon path={mdiChevronDoubleDown} size={1.5} color={'#fc7b44'}/>
                                    <p><span style={{fontWeight:'bold'}}>Destino:</span> Campos do Jordão, SP</p>
                                </div>
                               
                                <div style={{display:'flex', flexDirection:'column', alignItems:'start', justifyContent:'space-between', gap:10}}>
                                    <div className='distancia_card_tempo_desloc'>
                                        <Icon path={mdiCarArrowRight} size={1.25} />
                                        <h3>{JSON.stringify(distancias[0].tempoMinutos)} min</h3>
                                    </div>
                                    <div className='distancia_card_tempo_desloc'>
                                        <Icon path={mdiMapMarkerDistance} size={1.25} />
                                        <h3>{Math.round(distancias[0].distanciaKm)} Km</h3>
                                    </div>
                                </div>                                
                                
                            </div>
                        </div>

                        <div className='distancia_card'>
                            <h1>Santos</h1>
                            <h2>São Paulo - Litoral</h2>
                            <img className='cityPicture' src={santosIMG}></img>
                            <div className='distancia_card_info'>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <p><span style={{fontWeight:'bold'}}>Partida:</span> {rua}</p>
                                    <Icon path={mdiChevronDoubleDown} size={1.5} color={'#fc7b44'}/>
                                    <p><span style={{fontWeight:'bold'}}>Destino:</span> Santos, SP</p>
                                </div>
                               
                                <div style={{display:'flex', flexDirection:'column', alignItems:'start', justifyContent:'space-between', gap:10}}>
                                    <div className='distancia_card_tempo_desloc'>
                                        <Icon path={mdiCarArrowRight} size={1.25} />
                                        <h3>{JSON.stringify(distancias[2].tempoMinutos)} min</h3>
                                    </div>
                                    <div className='distancia_card_tempo_desloc'>
                                        <Icon path={mdiMapMarkerDistance} size={1.25} />
                                        <h3>{Math.round(distancias[2].distanciaKm)} Km</h3>
                                    </div>
                                </div>                                
                                
                            </div>
                        </div>

                        <div className='distancia_card'>
                            <h1>Praça da Sé</h1>
                            <h2>São Paulo - Centro da capital</h2>
                            <img className='cityPicture' src={seIMG}></img>
                            <div className='distancia_card_info'>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <p><span style={{fontWeight:'bold'}}>Partida:</span> {rua}</p>
                                    <Icon path={mdiChevronDoubleDown} size={1.5} color={'#fc7b44'}/>
                                    <p><span style={{fontWeight:'bold'}}>Destino:</span> Parça da Sé, São Paulo, SP</p>
                                </div>
                               
                                <div style={{display:'flex', flexDirection:'column', alignItems:'start', justifyContent:'space-between', gap:10}}>
                                    <div className='distancia_card_tempo_desloc'>
                                        <Icon path={mdiCarArrowRight} size={1.25} />
                                        <h3>{JSON.stringify(distancias[1].tempoMinutos)} min</h3>
                                    </div>
                                    <div className='distancia_card_tempo_desloc'>
                                        <Icon path={mdiMapMarkerDistance} size={1.25} />
                                        <h3>{Math.round(distancias[1].distanciaKm)} Km</h3>
                                    </div>
                                </div>                                
                                
                            </div>
                        </div>

                    </div>
                    
                </div>

            </section>


            <div className='section-separator'></div>

            <section className='relatorio_locais_proximos'>
                <div className='relatorio_secao_titulo'>
                    <h1>Estabelecimentos próximos</h1>
                    <p>Conheça alguns estabelecimentos próximos ao endereço</p>
                </div>
                
                <p className='micro-legenda' style={{marginTop:20, marginBottom:20, width:'100%', backgroundColor:'#FF6F3311', borderColor:'#FF6F3355', color:'#666'}}>
                    <span style={{fontWeight:'bold'}}><Icon path={mdiHelpCircleOutline} size={0.7} style={{ verticalAlign:'-3px'}} /> O que são essas informações?</span>
                    <br></br>
                    Principais serviços e comércios localizados à uma distância de até 15 minutos do endereço (caminhando), organizados por categoria.
                </p>

                <div className='group-lists'>
                    <div className='location-list'> 
                    <h1>Restaurantes</h1>           
                    {dataRelatorio.restaurantes.map((item,index) =>{
                        const props = item.properties;
                        
                        return (
                        props.name != "" && props.name != null ? (
                            <div className='location-item' key={index} >
                            <h2>{props.name || "Sem nome"}</h2>                      
                            <p>{props.address_line2 || "Endereço não informado"}</p>                
                            </div>
                        ):null
                        )
                    })}
                    </div>
        
                    <div className='location-list'> 
                    <h1>Supermercados</h1>           
                    {dataRelatorio.supermercados.map((item,index) =>{
                        const props = item.properties;
                        
                        return (
                        props.name != "" && props.name != null ? (
                            <div className='location-item' key={index} >
                            <h2>{props.name || "Sem nome"}</h2>                      
                            <p>{props.address_line2 || "Endereço não informado"}</p>                
                            </div>
                        ):null
                        )
                    })}
                    </div>
        
                    <div className='location-list'> 
                    <h1>Farmácias</h1>           
                    {dataRelatorio.farmacias.map((item,index) =>{
                        const props = item.properties;
        
                        return (
                        props.name != "" && props.name != null ? (
                        <div className='location-item' key={index} >
                            <h2>{props.name || "Sem nome"}</h2>                    
                            <p>{props.address_line2 || "Endereço não informado"}</p>                
                        </div> ):null
                        )
                    })}
                    </div>
        
                    <div className='location-list'> 
                    <h1>Hospitais</h1>           
                    {dataRelatorio.hospitais.map((item,index) =>{
                        const props = item.properties;
        
                        return (
                        props.name != "" && props.name != null ? (
                        <div className='location-item' key={index} >
                            <h2>{props.name || "Sem nome"}</h2>                    
                            <p>{props.address_line2 || "Endereço não informado"}</p>                
                        </div> ):null
                        )
                    })}
                    </div>
                </div>
            </section>
        </div>
    )
}