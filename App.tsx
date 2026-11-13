import React,{useEffect,useState} from 'react';
import {AppState,BackHandler,ScrollView,Text,View,useWindowDimensions} from 'react-native';
import {configurar} from './src/data/archivo';
import {Catalogo} from './src/ui/Catalogo';
import {Mesa} from './src/ui/Mesa';
import {Lista,Opcion,s} from './src/ui/componentes';
import {marcar,recargar,usePrograma} from './src/ui/programaModel';

type Inicio = {taskKey:string; offlineStart?:boolean};
export default function App({offlineStart}:Inicio) {
  const [lista,setLista] = useState(false);
  useEffect(()=>{
    (offlineStart ? configurar('disponible','no') : Promise.resolve()).then(()=>setLista(true));
  },[offlineStart]);
  return lista ? <Portada/> : <Text>Abriendo agenda…</Text>;
}

function Portada() {
  const [seccion,setSeccion] = useState('Programa');
  const [id,setId] = useState<string|null>(null);
  const {charlas} = usePrograma();
  const {width,height} = useWindowDimensions();
  const ficha = charlas.find(f=>f.id===id);
  useEffect(()=>{
    void recargar();
    const sub = AppState.addEventListener('change',v=>{if (v==='active') void recargar();});
    return ()=>sub.remove();
  },[]);
  useEffect(()=>{
    const sub = BackHandler.addEventListener('hardwareBackPress',()=>{
      if (id) { setId(null); return true; }
      if (seccion!=='Programa') { setSeccion('Programa'); return true; }
      return false;
    });
    return ()=>sub.remove();
  },[seccion,id]);
  return <View style={s.pagina}><Text>Jornadas del Sur</Text>
    <Text style={s.titulo}>{id?'Detalle':seccion}</Text>
    <ScrollView style={{flex:1}}>
      {id ? <View><Opcion texto="Volver" accion={()=>setId(null)}/>
        {ficha && <View><Text style={s.titulo}>{ficha.title}</Text><Text style={s.texto}>
          Día {ficha.day} · {ficha.time} · {ficha.room}</Text>
          <Text>{ficha.speaker}</Text><Text style={s.texto}>{ficha.summary}</Text>
          <Opcion texto={ficha.favorita?'Quitar de mi agenda':'Agregar a mi agenda'} accion={()=>marcar(ficha.id)}/>
        </View>}</View>
      : seccion==='Programa' ? <Catalogo key={width>height?'horizontal':'vertical'} abrir={setId}/>
      : seccion==='Mesa' ? <Mesa/> : <View>
        {!charlas.some(f=>f.favorita) && <Text>Todavía no agregaste charlas.</Text>}
        <Lista fichas={charlas.filter(f=>f.favorita)} abrir={setId}/></View>}
    </ScrollView>
    {!id && <View style={s.fila}>{['Programa','Mi agenda','Mesa'].map(t=>
      <Opcion key={t} texto={t} activa={seccion===t} accion={()=>setSeccion(t)}/>)}</View>}
  </View>;
}
