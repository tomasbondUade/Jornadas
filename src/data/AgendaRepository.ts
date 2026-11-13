import {api} from '../lab/servicio';
import {alternar, Ficha, guardar, listar} from './archivo';

export const agendaRepository = {
  listar,
  alternar,
  async sincronizar() {
    const respuesta = await api.get<Ficha[]>('/programa');
    await guardar(respuesta.data);
  },
};
