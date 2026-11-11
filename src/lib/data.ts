import raw from '../data/grupo.json';
import type { Empresa } from './engine.ts';

export const EMPRESAS = raw.empresas as unknown as Empresa[];
export const QSA = raw.qsa as { empresa: string; socios: string[] }[];
export const GRUPOS = [...new Set(EMPRESAS.map((e) => e.grupo))];
