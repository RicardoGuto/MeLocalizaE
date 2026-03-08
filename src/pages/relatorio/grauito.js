import './relatorio.css'

import Icon from '@mdi/react';
import { mdiBus, mdiCloud, mdiSecurity, mdiTree } from '@mdi/js';



export default function Gratuito({desbloquearRelatorio, dadosIndicadores}) {



    return(
        <div className="gratuito-container">       


            <div className="gratuito-unlock">
                <h1>Existem mais informações disponíveis</h1>
                <p>Desbloqueie esse relatório para ter acesso aos mais diversos tipos de informações com maior detalhamento.</p>

                <div className='gratuito-detalhes'>
                    <div className='gratuito-detalhes-seguranca'>
                        <h2><Icon path={mdiSecurity} size={1} />Segurança</h2>
                        <p className='seguranca-texto'>Foram registradas {dadosIndicadores.seguranca_publica} ocorrência(s) nos últimos 12 meses</p>
                        <h3>Principais ocorrências</h3>
                        <p>Desbloqueie o relatório para ver o grafico completo incluindo percentuais, frequências de horário, público alvo e histórico da região</p>
                    </div>                    
                    <div className='gratuito-detalhes-clima-tempo'>
                        <h2><Icon path={mdiCloud} size={1} />Clima e Tempo</h2>
                        <p>A média anual de temperatura é {Math.round(dadosIndicadores.climaTempo)} ºC</p>
                        <p>Desbloqueie o relatório para ver mais detalhes de Clima e Tempo historicamente na região.</p>
                    </div>                    
                    <div className='gratuito-detalhes-desastres-naturais'>
                        <h2><Icon path={mdiTree} size={1} />Desastres naturais</h2>
                        <p>Existe(m) {dadosIndicadores.desastres_naturais} ocorrência(s) de desastres naturais apontada(s).</p>
                        <p>Desbloqueie o relatório para conhecer mais detalhes</p>
                    </div>                    
                    <div className='gratuito-detalhes-transportes'>
                        <h2><Icon path={mdiBus} size={1} />Transporte Público</h2>
                        <p>Foram identificados {dadosIndicadores.pontos_onibus > 0 ?("pontos de ônibus"):null}{dadosIndicadores.terminais_onibus > 0 ?(", terminais"):null}{dadosIndicadores.estacoes_metro > 0 ?(" e estações de metrô"):null} nas proximidades.</p>
                        <p>Desbloqueie o relatório para ter acesso a esses pontos</p>
                    </div>                    
                </div>

                <button onClick={desbloquearRelatorio}>Desbloquear (1 crédito)</button>
            </div>
        </div>
    )
}