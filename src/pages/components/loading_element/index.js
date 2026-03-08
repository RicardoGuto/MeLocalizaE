import { mdiLoading } from "@mdi/js";
import Icon from '@mdi/react';
import './loading_element.css'
export default function LoadingElement({color, size}){
    return(
        <span className="default-loading_element"><Icon path={mdiLoading} size={size} color={color}/></span>
    )
}