import React,{useEffect,useState} from 'react';
import {BackHandler,ScrollView,Text,View} from 'react-native';
import {ajuste,configurar} from './src/data/archivo';
import {Catalogo} from './src/ui/Catalogo';
import {Mesa} from './src/ui/Mesa';
import {Lista,Opcion,s} from './src/ui/componentes';
import {iniciarPrograma,marcar,usePrograma} from './src/ui/programaModel';

type Inicio = {taskKey:string; offlineStart?:boolean};
type Vista = {seccion:string; id:string|null; dia:number; tema:string};
const vistaInicial: Vista = {seccion:'Programa', id:null, dia:0, tema:'Todos'};
// Mantiene el orden de las escrituras aunque el usuario cambie rápido de pantalla.
let escriturasVista: Promise<void> = Promise.resolve();

function interpretarVista(texto:string): Vista {
  try {
    const v = JSON.parse(texto);
    return {
      seccion: ['Programa','Mi agenda','Mesa'].includes(v.seccion) ? v.seccion : 'Programa',
      id: typeof v.id === 'string' ? v.id : null,
      dia: [0,1,2].includes(v.dia) ? v.dia : 0,
      tema: ['Todos','Android','Datos','Calidad'].includes(v.tema) ? v.tema : 'Todos',
    };
  } catch { return vistaInicial; }
}

export default function App({taskKey,offlineStart}:Inicio) {
  const [vista,setVista] = useState<Vista|null>(null);
  const clave = `vista:${taskKey}`;
  useEffect(()=>{
    let activa = true;
    async function preparar() {
      if (offlineStart) await configurar('disponible','no');
      await escriturasVista;
      const guardada = interpretarVista(await ajuste(clave, ''));
      if (activa) setVista(guardada);
    }
    void preparar();
    return ()=>{activa = false;};
  },[clave,offlineStart]);
  useEffect(()=>{
    if (!vista) return;
    const valor = JSON.stringify(vista);
    escriturasVista = escriturasVista.catch(()=>{}).then(()=>configurar(clave,valor));
  },[clave,vista]);
  return vista ? <Portada vista={vista} setVista={setVista}/> : <Text style={s.texto}>Abriendo agenda…</Text>;
}

function Portada({vista,setVista}:{vista:Vista; setVista:React.Dispatch<React.SetStateAction<Vista|null>>}) {
  const {seccion,id,dia,tema} = vista;
  const {charlas} = usePrograma();
  const ficha = charlas.find(f=>f.id===id);
  function cambiar(cambios:Partial<Vista>) {
    setVista(actual => actual ? {...actual,...cambios} : actual);
  }
  useEffect(()=>{ iniciarPrograma(); },[]);
  useEffect(()=>{
    const sub = BackHandler.addEventListener('hardwareBackPress',()=>{
      if (id) { cambiar({id:null}); return true; }
      if (seccion!=='Programa') { cambiar({seccion:'Programa'}); return true; }
      return false;
    });
    return ()=>sub.remove();
  },[seccion,id]);
  return <View style={s.pagina}><Text style={s.texto}>Jornadas del Sur</Text>
    <Text style={s.titulo}>{id?'Detalle':seccion}</Text>
    <ScrollView style={{flex:1}}>
      {id ? <View><Opcion texto="Volver" accion={()=>cambiar({id:null})}/>
        {ficha && <View><Text style={s.titulo}>{ficha.title}</Text><Text style={s.texto}>
          Día {ficha.day} · {ficha.time} · {ficha.room}</Text>
          <Text style={s.texto}>{ficha.speaker}</Text><Text style={s.texto}>{ficha.summary}</Text>
          <Opcion texto={ficha.favorita?'Quitar de mi agenda':'Agregar a mi agenda'} accion={()=>marcar(ficha.id)}/>
        </View>}</View>
      : seccion==='Programa' ? <Catalogo abrir={idElegido=>cambiar({id:idElegido})}
          dia={dia} tema={tema} elegirDia={nuevo=>cambiar({dia:nuevo})}
          elegirTema={nuevo=>cambiar({tema:nuevo})}/>
      : seccion==='Mesa' ? <Mesa/> : <View>
        {!charlas.some(f=>f.favorita) && <Text style={s.texto}>Todavía no agregaste charlas.</Text>}
        <Lista fichas={charlas.filter(f=>f.favorita)} abrir={idElegido=>cambiar({id:idElegido})}/></View>}
    </ScrollView>
    {!id && <View style={s.fila}>{['Programa','Mi agenda','Mesa'].map(t=>
      <Opcion key={t} texto={t} activa={seccion===t} accion={()=>cambiar({seccion:t})}/>)}</View>}
  </View>;
}
