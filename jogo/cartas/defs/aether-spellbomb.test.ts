import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Aether Spellbomb";
describe(N, () => {
  it("sacrifica como custo e devolve a criatura alvo ao dono", () => {

    const tg = setup({ battlefield: [[N, 'Island'], ['Elvish Mystic']] }); tg.choose('criatura alvo', ['Elvish Mystic']).activate(N, 'devolva').resolveAll();
    expect(tg.find(N, 'graveyard')).not.toBeNull(); expect(tg.names(1, 'hand')).toContain('Elvish Mystic');
  });

  it("modo de comprar funciona; cancelar o pagamento conserva artefato e mana", () => {

    const tg = setup({ battlefield: [[N, 'Island'], []] }); tg.script.push(d => d.kind === 'payment' ? { kind: 'payment', cancel: true } : null); tg.activate(N, 'compre');
    expect(tg.find(N)).not.toBeNull(); expect(tg.state.objects[tg.bf('Island')].tapped).toBe(false);
    tg.activate(N, 'compre').resolveAll(); expect(tg.state.zones.hand[0]).toHaveLength(1); expect(tg.find(N)).toBeNull();
  });
});
