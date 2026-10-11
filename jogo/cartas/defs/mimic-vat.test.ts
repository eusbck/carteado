import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mimic Vat';
const ilhas = Array(6).fill('Island');

describe(N, () => {
  it('criatura de um oponente que morre também pode ser exilada; a ficha tem ímpeto e é exilada na etapa final', () => {
    const tg = setup({ battlefield: [[N, ...ilhas], ['Indomitable Ancients']] });
    tg.yes(N, true);
    tg.run(destroy(tg.g, [tg.bf('Indomitable Ancients')]));
    tg.resolveAll();
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    tg.activate(N).resolveAll();
    const ficha = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[ficha].isToken).toBe(true);
    expect(tg.state.objects[ficha].controller).toBe(0);
    expect(tg.pt(ficha)).toEqual([2, 10]);
    expect(hasKw(tg.g, ficha, 'haste')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(tg.find('Indomitable Ancients')).toBeNull();
    // a carta continua exilada com o Vat: dá para criar outra ficha depois
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
  });

  it('imprimindo outra carta, a anterior volta para o cemitério do dono e a ficha copia a nova', () => {
    const tg = setup({ battlefield: [[N, ...ilhas, 'Elvish Mystic'], ['Indomitable Ancients']] });
    tg.yes(N, true);
    tg.run(destroy(tg.g, [tg.bf('Indomitable Ancients')]));
    tg.resolveAll();
    tg.yes(N, true);
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.find('Elvish Mystic', 'exile')).not.toBeNull();
    expect(tg.find('Indomitable Ancients', 'graveyard', 1)).not.toBeNull();
    tg.activate(N).resolveAll();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });

  it('é opcional, e fichas que morrem não disparam', () => {
    const tg = setup({ battlefield: [[N, ...ilhas, 'Elvish Mystic', { name: 'Cat verde 1/1', token: true }], []] });
    let perguntas = 0;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.startsWith(N)) { perguntas++; return { kind: 'select', ids: ['no'] }; } return null; });
    tg.run(destroy(tg.g, [tg.bf('Cat verde 1/1')]));
    tg.resolveAll();
    expect(perguntas).toBe(0);
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(perguntas).toBe(1);
    expect(tg.find('Elvish Mystic', 'graveyard', 0)).not.toBeNull();
  });

  it('sem carta exilada, a habilidade não cria nada', () => {
    const tg = setup({ battlefield: [[N, ...ilhas], []] });
    tg.activate(N).resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken)).toHaveLength(0);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
