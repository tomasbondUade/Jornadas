import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {Charla} from '../data/archivo';

export const s = StyleSheet.create({
  pagina:{flex:1,backgroundColor:'#f8f7f1',padding:16},
  fila:{flexDirection:'row',flexWrap:'wrap',gap:6,marginVertical:5},
  titulo:{fontSize:27,fontWeight:'700',color:'#183f39',marginVertical:8},
  texto:{fontSize:16,color:'#213a36',marginVertical:4},
  boton:{borderRadius:8,borderWidth:1,borderColor:'#457369',padding:9},
  activo:{backgroundColor:'#c5e6da'},
  tarjeta:{backgroundColor:'white',padding:14,marginVertical:4,borderRadius:10},
});
export function Opcion({texto,accion,activa=false}:{texto:string;accion:()=>void;activa?:boolean}) {
  return <Pressable accessibilityRole="button" onPress={accion} style={[s.boton,activa && s.activo]}>
    <Text style={{color:'#19453b'}}>{texto}</Text></Pressable>;
}
export function Lista({fichas,abrir}:{fichas:Charla[];abrir:(id:string)=>void}) {
  return <View>{fichas.map(f=><Pressable key={f.id} onPress={()=>abrir(f.id)} style={s.tarjeta}>
    <Text>Día {f.day} · {f.time} · {f.room}</Text><Text style={s.texto}>{f.title}</Text>
    <Text>{f.track}{f.favorita ? ' · En mi agenda' : ''}</Text></Pressable>)}</View>;
}
