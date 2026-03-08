import './footer.css'
import Icon from '@mdi/react';
import { mdiFacebook, mdiInstagram, mdiLinkedin, mdiTwitter, mdiYoutube } from '@mdi/js';
import { Link } from 'react-router-dom';

export default function Footer(){
    return(
        <div className='footer_footer-base'>
            <div className='footer_column'>
                <h1>Páginas</h1>
                <div className='footer_list-items'>
                    <a href='#'>Início</a>
                    <a href='#'>Sobre</a>
                    <a href='#'>Planos</a>
                    <a href='#'>Termos de Uso</a>
                    <Link to='/PoliticaPrivacidade'>Políticas de Privacidade</Link>
                </div>
            </div>
            <div className='footer_column'>
                <h1>Redes Sociais</h1>
                <div className='footer_list-items'>
                    <a href='#'><Icon path={mdiInstagram} size={1} /> Instagram</a>
                    <a href='#'><Icon path={mdiFacebook} size={1} /> Facebook</a>
                    <a href='#'><Icon path={mdiLinkedin} size={1} /> Linkedin</a>
                    <a href='#'><Icon path={mdiYoutube} size={1} /> Youtube</a>
                </div>
            </div>
            <div className='footer_column'>
                <h1>Demais informações</h1>
                <div className='footer_list-items'>
                    <a href='#'>Fale Conosco</a>
                    <a href='#'>Perguntas frequentes</a>
                    <a href='#'>Telefone: (00) 00000-0000</a>
                    <a href='#'>Endereço: Rua xxxxxx xxxxxxx xxxxxx</a>
                </div>
            </div>

        </div>
    )
}