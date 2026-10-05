import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Changing Loyalty', () => {
  it('replicar: uma cópia (ficha) encantando outra criatura; quando a encantada morre, volta para você', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Elvish Mystic', 'Wall of Omens']], hand: [['Changing Loyalty', 'Infernal Grasp'], []], library: [['Island'], ['Island']] });
    tg.number('quantas vezes', 1).choose('criatura', ['Elvish Mystic']);
    tg.yes('novos alvos', true).choose('criatura', ['Wall of Omens']);
    tg.cast('Changing Loyalty').resolveAll();
    const auras = tg.all('Changing Loyalty');
    expect(auras.length).toBe(2);
    expect(auras.some((id) => tg.state.objects[id].isToken)).toBe(true);
    expect(auras.map((id) => tg.state.objects[id].attachedTo).sort()).toEqual([tg.bf('Elvish Mystic'), tg.bf('Wall of Omens')].sort());
  });
  it('copia mesmo que a original já tenha saído da pilha', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Elvish Mystic', 'Island', 'Island']], hand: [['Changing Loyalty'], ['Counterspell']], library: [[], ['Island']] });
    tg.number('quantas vezes', 1).choose('criatura', ['Elvish Mystic']);
    tg.cast('Changing Loyalty');
    // Bruno anula a original em resposta ao gatilho de replicar
    tg.pass();
    tg.choose('mágica alvo', ['Changing Loyalty']).cast('Counterspell').resolve();
    tg.yes('novos alvos', false);
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Changing Loyalty']);
    expect(tg.state.objects[tg.bf('Changing Loyalty')].isToken).toBe(true);
  });
  it('quando a criatura encantada morre, volta ao campo sob o seu controle', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients', { name: 'Changing Loyalty', attachTo: 'Indomitable Ancients' }]], hand: [['Infernal Grasp'], []] });
    tg.state.objects[tg.bf('Changing Loyalty')].controller = 0;
    tg.refresh();
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolve().resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].controller).toBe(0);
  });
});
