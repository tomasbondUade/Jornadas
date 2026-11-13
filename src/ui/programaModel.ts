import {useSyncExternalStore} from 'react';
import {agendaRepository as repo} from '../data/AgendaRepository';
import {Charla} from '../data/archivo';

type Estado = {charlas: Charla[]; dia: number; cargando: boolean; aviso: string;
  edicionGuardada: boolean};
let estado: Estado = {charlas: [], dia: 0, cargando: false, aviso: '', edicionGuardada: false};
const observadores = new Set<() => void>();
function publicar(cambios: Partial<Estado>) {
  estado = {...estado,...cambios};
  observadores.forEach(fn => fn());
}
function suscribir(fn: () => void) {
  observadores.add(fn);
  return () => { observadores.delete(fn); };
}
export function usePrograma() {
  return useSyncExternalStore(suscribir, () => estado);
}
export const elegirDia = (dia: number) => publicar({dia});
export async function recargar() {
  publicar({cargando:true,aviso:''});
  try {
    const charlas = await repo.listar();
    const edicionGuardada = await repo.hayEdicionGuardada();
    publicar({charlas, edicionGuardada});
    await repo.sincronizar();
    publicar({charlas:await repo.listar(), edicionGuardada:true});
  } catch {
    publicar({aviso: estado.edicionGuardada
      ? 'No se pudo actualizar el programa. Se están usando datos guardados.'
      : 'No se pudo consultar el programa. Intentá nuevamente.'});
  } finally {
    publicar({cargando:false});
  }
}
export async function marcar(id: string) {
  await repo.alternar(id);
  publicar({charlas:await repo.listar()});
}
