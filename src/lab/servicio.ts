import axios from 'axios';
import {ajuste,Ficha} from '../data/archivo';
import uno from './programa-1.json';
import dos from './programa-2.json';
import tres from './programa-3.json';
import cuatro from './programa-4.json';

const ediciones: Ficha[][] = [uno,dos,tres,cuatro];
export let solicitudes = 0;

export const api = axios.create({
  baseURL: 'https://programa.invalid',
  adapter: async config => {
    solicitudes++;
    const [revision, disponible, lenta] = await Promise.all([
      ajuste('revision','1'), ajuste('disponible','si'), ajuste('lenta','no'),
    ]);
    await new Promise<void>(resolve => setTimeout(resolve, lenta === 'si' ? 8000 : 1400));
    if (disponible === 'no') throw new Error('Servicio desconectado');
    return {data: ediciones[Number(revision)-1], status: 200, statusText: 'OK', headers: {}, config};
  },
});
