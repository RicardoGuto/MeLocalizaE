import './loading.css'
import Icon from '@mdi/react';
import { mdiLoading} from '@mdi/js';

export default function LoadingRelatorio({loadBar, setLoadBar}){
    return(

        <div className='loading-relatorio_screen'>

            <span><Icon path={mdiLoading} size={3} color={'#fc7b44'}/></span>
            <h1 style={{color:'#444', fontSize:24}}>Carregando relatório...</h1>
            <p style={{color:'#888'}}>Estamos coletando todas as informações para você</p>
            <div className="barra-loading-progresso">
                <div className='barra-loading' style={{width: `${loadBar}%`}}></div>
            </div>
            <p style={{color:'#888', fontSize:12, fontStyle:'italic', marginTop:5}}>Isso pode levar alguns minutos</p>
        </div>
    )
}