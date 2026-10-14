import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { gainLife } from '../../motor/api.ts';
import { chars } from '../../motor/chars.ts';

const NOME = "Gourmand's Talent";

describe(NOME, () => {
  it('no seu turno, o Sol Ring é Food e pode ser comido; no turno do oponente, não', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Forest', 'Forest'], []] });
    const sol = tg.bf('Sol Ring');
    expect(chars(tg.g, sol).subtypes).toContain('Food');
    tg.activate('Sol Ring', 'ganha 3').resolve();
    expect(tg.life(0)).toBe(43);
    expect(tg.names(0, 'graveyard')).toEqual(['Sol Ring']);
    const tg2 = setup({ active: 1, battlefield: [[NOME, 'Sol Ring'], []] });
    expect(chars(tg2.g, tg2.bf('Sol Ring')).subtypes).not.toContain('Food');
  });

  it('no nível 1 só dá para ganhar o nível 2', () => {
    const tg = setup({ battlefield: [[NOME, 'Forest', 'Forest', 'Forest', 'Forest'], []] });
    const acoes = () => tg.pending?.kind === 'priority' ? tg.pending.actions.map((a) => a.label) : [];
    expect(acoes().some((l) => l.includes('Nível 2'))).toBe(true);
    expect(acoes().some((l) => l.includes('Nível 3'))).toBe(false);
    tg.activate(NOME, 'Nível 2').resolve();
    expect(tg.state.objects[tg.bf(NOME)].classLevel).toBe(2);
  });

  it('nível 2: no primeiro ganho de vida do turno cria um Raccoon 3/3; no segundo, não', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    tg.state.objects[tg.bf(NOME)].classLevel = 2;
    gainLife(tg.g, 0, 2, null);
    tg.refresh().resolveAll();
    expect(tg.all('Raccoon').length).toBe(1);
    expect(tg.pt(tg.bf('Raccoon'))).toEqual([3, 3]);
    gainLife(tg.g, 0, 2, null);
    tg.refresh().resolveAll();
    expect(tg.all('Raccoon').length).toBe(1);
  });

  it('nível 3: no primeiro ganho de vida do turno, um marcador em cada criatura sua', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens'], ['Indomitable Ancients']] });
    tg.state.objects[tg.bf(NOME)].classLevel = 3;
    gainLife(tg.g, 0, 1, null);
    tg.refresh().resolveAll();
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['+1/+1'] ?? 0).toBe(0);
  });
});
