// Formato utilizado por la primera edición, de un solo día.
type Turno = {inicio:number;actividad:string;aula:string};
export function filasParaImprimir(turnos:Turno[]) {
  return [...turnos].sort((a,b)=>a.inicio-b.inicio).map(t=>{
    const hora = Math.floor(t.inicio/60).toString().padStart(2,'0');
    const minuto = (t.inicio%60).toString().padStart(2,'0');
    return hora+':'+minuto+'  '+t.actividad+' / '+t.aula;
  });
}
