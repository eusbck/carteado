// Tamanho da sala: de 2 a 6 lugares (o número de lugares é o tamanho de `sala.assentos`).

export const LUGARES = [2, 3, 4, 5, 6] as const;

const NUMEROS: Record<number, string> = { 3: 'Três', 4: 'Quatro', 5: 'Cinco', 6: 'Seis' };

/** "Um contra um" ou "Cinco jogadores, todos contra todos" */
export const descricaoLugares = (n: number): string => (n <= 2 ? 'Um contra um' : `${NUMEROS[n] ?? n} jogadores, todos contra todos`);
