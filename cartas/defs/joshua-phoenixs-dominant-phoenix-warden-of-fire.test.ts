import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

describe("Joshua, Phoenix's Dominant // Phoenix, Warden of Fire", () => {
  it('pode descartar nenhuma; compra o mesmo número', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains', 'Plains'], []], hand: [["Joshua, Phoenix's Dominant // Phoenix, Warden of Fire", 'Island'], []], library: [['Swamp', 'Swamp'], []] });
    tg.choose('Descarte', ['Island']);
    tg.cast("Joshua, Phoenix's Dominant").resolve().resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
  });
  it('a carta entra com a frente para cima, a menos que mandem voltar transformada; a Saga vai do I ao III e volta como Joshua', () => {
    const tg = setup({
      battlefield: [[{ name: "Joshua, Phoenix's Dominant // Phoenix, Warden of Fire", ready: true }, 'Mountain', 'Mountain', 'Mountain', 'Plains', 'Plains'], []],
      graveyard: [['Glissa Sunslayer', 'Gau, Feral Youth', 'Archfiend of Depravity'], []], library: [Array(10).fill('Island'), Array(10).fill('Island')],
    });
    const t0 = tg.state.turn.number;
    tg.activate("Joshua, Phoenix's Dominant").resolve().resolveAll();
    const fenix = () => tg.state.zones.battlefield.find((id) => tg.state.objects[id].def.startsWith('Joshua'))!;
    expect(chars(tg.g, fenix()).name).toBe('Phoenix, Warden of Fire');
    expect(tg.state.objects[fenix()].counters.lore).toBe(1);
    expect(tg.life(1)).toBe(38); // capítulo I
    // próximo turno de Ana: capítulo II
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'main1' && x.state.turn.number > t0).resolveAll();
    expect(tg.life(1)).toBe(36);
    // capítulo III: Glissa (3) + Gau (2) = 5; Archfiend (6) não cabe junto
    tg.script.push((d, x) => {
      if (d.kind !== 'select' || !d.prompt.includes('valor de mana total 6')) return null;
      const id = (l: string) => d.items.find((i) => i.label === l)!.id;
      expect(x.game.check(0, { kind: 'select', ids: [id('Glissa Sunslayer'), id('Archfiend of Depravity')] })).not.toBeNull();
      return { kind: 'select', ids: [id('Glissa Sunslayer'), id('Gau, Feral Youth')] };
    });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Descarte') ? { kind: 'select', ids: [] } : null));
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'main1' && x.state.turn.number > t0 + 2).resolveAll();
    expect(tg.find('Glissa Sunslayer')).not.toBeNull();
    expect(tg.find('Gau, Feral Youth')).not.toBeNull();
    expect(chars(tg.g, fenix()).name).toBe("Joshua, Phoenix's Dominant");
    expect(tg.state.objects[fenix()].counters.lore ?? 0).toBe(0);
  });
});
