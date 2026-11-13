import React,{useEffect,useState} from 'react';
import {Text,View} from 'react-native';
import {ajuste,configurar} from '../data/archivo';
import {solicitudes} from '../lab/servicio';
import {s,Opcion} from './componentes';

export function Mesa() {
  const [valores,setValores] = useState<Record<string,string>>({});
  useEffect(()=>{void Promise.all([ajuste('revision','1'),ajuste('disponible','si'),ajuste('lenta','no')])
    .then(([revision,disponible,lenta])=>setValores({revision,disponible,lenta}));},[]);
  async function cambiar(k:string,v:string) {
    await configurar(k,v);
    setValores(prev=>({...prev,[k]:v}));
  }
  return <View><Text style={s.texto}>Peticiones en esta sesión: {solicitudes}</Text>
    <Text>Edición del programa</Text><View style={s.fila}>{['1','2','3','4'].map(v=>
      <Opcion key={v} texto={'v'+v} activa={valores.revision===v} accion={()=>cambiar('revision',v)}/>)}</View>
    <Text>Servicio disponible</Text><View style={s.fila}>{['si','no'].map(v=>
      <Opcion key={v} texto={v} activa={valores.disponible===v} accion={()=>cambiar('disponible',v)}/>)}</View>
    <Text>Demora de cada petición</Text><View style={s.fila}>{['no','si'].map(v=>
      <Opcion key={v} texto={v==='si'?'8 segundos':'1,4 segundos'} activa={valores.lenta===v} accion={()=>cambiar('lenta',v)}/>)}</View>
  </View>;
}
