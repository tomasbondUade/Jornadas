import {api} from '../lab/servicio';
import {alternar, Ficha, guardar, hayEdicionGuardada, listar} from './archivo';

export const agendaRepository = {
  listar,
  alternar,
  hayEdicionGuardada,
  async sincronizar() {
    const respuesta = await api.get<Ficha[]>('/programa');
    await guardar(respuesta.data);
  },
};
