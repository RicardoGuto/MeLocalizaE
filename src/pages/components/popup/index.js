import './popup.css'
import Icon from '@mdi/react';
import {mdiAlertCircleOutline, mdiCancel} from '@mdi/js';

export default function Popup({titulo, mensagem, opcoes, icone, setPopup, popup}) {

  return (
    popup && 
    <div className="popup">
        <div className='popup-box'>
            <div className='popup_titulo'>
                {icone === 'erro' ? 
                    (
                    <Icon path={mdiAlertCircleOutline} size={1} color={'#921e21'} />
                    ):
                    icone==='cancel'?
                    (
                    <Icon path={mdiCancel} size={1} color={'#921e21'} />
                    ):null
                }
                <h1>{titulo}</h1>
            </div>

            
            <p>{mensagem}</p>
            {opcoes === 'ok' ? 
                (
                <button onClick={()=>setPopup(false)}>Ok</button>
                ):null
            }
        </div>
        
    </div>
    );
}
