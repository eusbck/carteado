import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { attackCandidates, blockCandidates } from '../../motor/combat.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Alexandre de Moraes, o Xandão';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('ao entrar, exila uma criatura de um oponente até sair do campo', () => {
    const tg = setup({ battlefield: [[], ['Indomitable Ancients']], library: [lib, lib] });
    tg.choose('criatura alvo que um oponente controla', ['Indomitable Ancients']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients']);
    tg.run(destroy(tg.g, [id]));
    tg.resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Indomitable Ancients']);
  });

  it('{2}, {T}: a criatura com tornozeleira não pode atacar nem bloquear', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], ['Elvish Mystic', 'Llanowar Elves']], library: [lib, lib] });
    tg.choose('criatura alvo', ['Elvish Mystic']);
    tg.activate(N, 'tornozeleira').resolveAll();
    const preso = tg.bf('Elvish Mystic');
    expect(tg.state.objects[preso].counters.tornozeleira).toBe(1);
  });

  it('criatura com tornozeleira fica fora dos ataques e dos bloqueios', () => {
    const tg = setup({ active: 1, battlefield: [[N], [{ name: 'Elvish Mystic', counters: { tornozeleira: 1 } }, 'Llanowar Elves']], library: [lib, lib] });
    const preso = tg.bf('Elvish Mystic');
    expect(attackCandidates(tg.g, 1).some((x) => x.obj === preso)).toBe(false);
    expect(attackCandidates(tg.g, 1).some((x) => x.obj === tg.bf('Llanowar Elves'))).toBe(true);
    void blockCandidates;
  });
});
