import {useSyncExternalStore} from 'react';
import {agendaRepository as repo} from '../data/AgendaRepository';
import {Charla} from '../data/archivo';

type Estado = {charlas: Charla[]; cargando: boolean; aviso: string;
  edicionGuardada: boolean};
let estado: Estado = {charlas: [], cargando: false, aviso: '', edicionGuardada: false};
const observadores = new Set<() => void>();
let inicioSolicitado = false;
let descargaEnCurso = false;
let descargaPendiente = false;
let versionLectura = 0;
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
async function publicarLecturas() {
  const version = ++versionLectura;
  const charlas = await repo.listar();
  if (version === versionLectura) publicar({charlas});
}

async function descargar() {
  publicar({cargando:true,aviso:''});
  try {
    const edicionGuardada = await repo.hayEdicionGuardada();
    await publicarLecturas();
    publicar({edicionGuardada});
    await repo.sincronizar();
    await publicarLecturas();
    publicar({edicionGuardada:true});
  } catch {
    publicar({aviso: estado.edicionGuardada
      ? 'No se pudo actualizar el programa. Se están usando datos guardados.'
      : 'No se pudo consultar el programa. Intentá nuevamente.'});
  }
}

// Solo una descarga a la vez; varios toques durante la espera acumulan una más.
export async function recargar() {
  if (descargaEnCurso) {
    descargaPendiente = true;
    return;
  }
  descargaEnCurso = true;
  try {
    do {
      descargaPendiente = false;
      await descargar();
    } while (descargaPendiente);
  } finally {
    descargaEnCurso = false;
    publicar({cargando:false});
  }
}

// El módulo vive durante el proceso JS, aunque la pantalla se monte de nuevo.
export function iniciarPrograma() {
  if (inicioSolicitado) return;
  inicioSolicitado = true;
  void recargar();
}
export async function marcar(id: string) {
  await repo.alternar(id);
  await publicarLecturas();
}
