import { describe, expect, it } from 'vitest';
import { isAttacking, nameOf } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Thousand-Faced Shadow';

describe(N, () => {
  it('entra pelo ninjutsu e copia outra atacante; a ficha entra virada e atacando', () => {
    const tg = setup({ battlefield: [['Memnite', 'Indomitable Ancients', 'Island', 'Island', 'Island', 'Island'], []], hand: [[N], []] });
    tg.attack([['Memnite', 1], ['Indomitable Ancients', 1]]).passTo('declareBlockers');
    tg.choose('outra criatura atacante', ['Indomitable Ancients']);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Devolva') ? { kind: 'select', ids: [d.items.find((i) => i.label === 'Memnite')!.id] } : null));
    tg.activate(N, 'Ninjutsu').resolveAll();
    const copias = tg.state.zones.battlefield.filter((id) => nameOf(tg.g, id) === 'Indomitable Ancients');
    expect(copias.length).toBe(2);
    const ficha = copias.find((id) => tg.state.objects[id].isToken)!;
    expect(tg.state.objects[ficha].tapped).toBe(true);
    expect(isAttacking(tg.g, ficha)).toBe(true);
    tg.passTo('main2', 0);
    // Shadow 1/1 + Ancients 2 + cópia 2
    expect(tg.life(1)).toBe(40 - 1 - 2 - 2);
  });
  it('conjurada (entra vinda da pilha, sem atacar), não dispara', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[N], []] });
    tg.cast(N).resolve();
    expect(tg.find(N, 'battlefield')).not.toBeNull();
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
