
import Icon from '@mdi/react';
import { mdiAccountCheckOutline, mdiBookOpenPageVariantOutline, mdiCityVariantOutline, mdiDatabaseMarkerOutline, mdiFlagCheckered, mdiMapMarkerPath, mdiOfficeBuildingCogOutline, mdiPoliceBadge, mdiScaleBalance, mdiShieldLockOutline, mdiSquareOpacity, mdiToolboxOutline, mdiTools, mdiTrainCar } from "@mdi/js";
import Header from "../components/header";
import './sobre.css'
import Footer from '../components/footer';
import HomemChaveFoto from './img/homem-segurando-chave.png'
import logoMelocalizaE from './../../assets/logo_vetor_v1.png'

export default function Sobre({}){
    return(
        <div className="sobre-container">
            <Header></Header>

            <div className="sobre_conteudo">
                <div style={{width:'100%', display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20}}>
                    <img style={{width:'500px',}} src={logoMelocalizaE}></img>
                </div>

                <h1>Sobre a Me localizaÊ</h1>

                <h2><Icon path={mdiBookOpenPageVariantOutline} size={1} /> Quem somos</h2>

                <p>A Me localizaÊ nasce para resolver uma dor comum de quem está prestes a se mudar: a falta de informações confiáveis, organizadas e fáceis de entender sobre os bairros de uma cidade.</p>

                <p>Somos uma startup que combina dados, análise e tecnologia para ajudar pessoas a escolherem onde morar com mais segurança, clareza e confiança. Nosso foco é transformar informações dispersas, muitas vezes confusas ou contraditórias, em insights objetivos, que apoiam decisões importantes da vida real.</p>

                <h3>Antes de se mudar, se localizaÊ!</h3>

                <div className='section-separator'></div>



                <div className='grupo-missao'>
                    <div className='texto-missao'>
                        <h2><Icon path={mdiFlagCheckered} size={1} /> Nossa missão</h2>
                        <p>Ajudar pessoas a tomarem decisões melhores sobre onde morar, oferecendo informações confiáveis, acessíveis e inteligentes sobre bairros, cidades e regiões.</p>

                        <p>Queremos reduzir incertezas, evitar escolhas baseadas apenas em percepções e tornar o processo de mudança mais simples, transparente e seguro.</p>
                    </div>                                               
                    <div>
                        <img className='img-missao' src={HomemChaveFoto}></img>
                    </div>
                </div> 

                <div className='section-separator'></div>

                <h2><Icon path={mdiScaleBalance} size={1} />Nossos valores</h2>
                <div className="h3-topic" style={{backgroundColor:'#f1571511'}}>            
                    <h3><Icon path={mdiSquareOpacity} size={0.75} />Transparência</h3>
                    <p>Acreditamos em dados claros, fontes confiáveis e comunicação honesta. Informação boa é aquela que pode ser compreendida e utilizada.</p>
                </div>

                <div className="h3-topic"style={{backgroundColor:'#f1571509'}}> 
                    <h3><Icon path={mdiDatabaseMarkerOutline} size={0.75} />Decisão baseada em dados</h3>
                    <p>Usamos dados e análises para reduzir achismos e apoiar escolhas mais conscientes.</p>
                </div>

                <div className="h3-topic" style={{backgroundColor:'#f1571507'}}> 
                    <h3><Icon path={mdiAccountCheckOutline} size={1} />Centralidade no usuário</h3>
                    <p>Criamos soluções a partir das dores reais de quem está se mudando. A experiência do usuário guia nossas decisões.</p>
                </div>

                <div className="h3-topic" style={{backgroundColor:'#f1571505'}}> 
                    <h3><Icon path={mdiShieldLockOutline} size={1} />Responsabilidade com dados</h3>
                    <p>Privacidade e segurança da informação são prioridades desde o primeiro dia.</p>
                </div>


                <div className='section-separator'></div>

                <h2><Icon path={mdiTools} size={1} />O que fazemos</h2>
                
                <p>A Me localizaÊ oferece relatórios e análises sobre bairros, reunindo informações como:</p>

                <ul>
                    <li style={{backgroundColor:'#690000'}}><Icon path={mdiPoliceBadge} size={0.75}/>Segurança</li>
                    <li style={{backgroundColor:'#399B3E'}}><Icon path={mdiTrainCar} size={0.75}/>Mobilidade</li>
                    <li style={{backgroundColor:'#6A9EDA'}}><Icon path={mdiOfficeBuildingCogOutline} size={0.75} />Infraestrutura</li>
                    <li style={{backgroundColor:'#FF6F33'}}><Icon path={mdiToolboxOutline} size={0.75} />Serviços e conveniências</li>
                    <li style={{backgroundColor:'#e6bd0a'}}><Icon path={mdiCityVariantOutline} size={0.75} />Indicadores urbanos relevantes</li>
                </ul>

                <p>Tudo isso em um só lugar, de forma prática, confiável e orientada à decisão.</p>

                <div className='section-separator'></div>

                <h2><Icon path={mdiMapMarkerPath} size={1} />Onde estamos indo</h2>
                
                <p>Estamos em fase de lançamento e evolução contínua da plataforma. Nosso compromisso é crescer junto com nossos usuários, aprimorando constantemente nossos dados, funcionalidades e experiência.</p>

                <h3>Se você está pensando em se mudar, a Me localizaÊ está aqui para ajudar você a encontrar o bairro certo</h3>

            </div>

            <Footer></Footer>
        </div>
    )
}