import React from 'react';
import {Text,View} from 'react-native';
import {recargar,usePrograma} from './programaModel';
import {Lista,Opcion,s} from './componentes';

export function Catalogo({abrir,dia,tema,elegirDia,elegirTema}:{abrir:(id:string)=>void;
  dia:number; tema:string; elegirDia:(dia:number)=>void; elegirTema:(tema:string)=>void}) {
  const {charlas,aviso,cargando,edicionGuardada} = usePrograma();
  return <View>
    <View style={s.fila}>{['Ambos días','Día 1','Día 2'].map((t,i)=>
      <Opcion key={t} texto={t} activa={dia===i} accion={()=>elegirDia(i)}/>)}</View>
    <View style={s.fila}>{['Todos','Android','Datos','Calidad'].map(t=>
      <Opcion key={t} texto={t} activa={tema===t} accion={()=>elegirTema(t)}/>)}</View>
    <Opcion texto="Actualizar" accion={recargar}/>
    {cargando && <Text>Consultando programa…</Text>}
    {aviso ? <View><Text>{aviso}</Text><Opcion texto="Reintentar" accion={recargar}/></View> : null}
    {edicionGuardada && charlas.length === 0
      ? <Text>Sin charlas programadas.</Text>
      : <Lista fichas={charlas.filter(f=>(!dia || f.day===dia) && (tema==='Todos' || f.track===tema))} abrir={abrir}/>}
  </View>;
}
