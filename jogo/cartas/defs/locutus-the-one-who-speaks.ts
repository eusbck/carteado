// Locutus, the One Who Speaks
// Artifact creatures you control get +1/+1.
// {W}{B}, Discard this card: It deals 2 damage to target creature. You gain 2 life.
import { activated, dealDamage, defineCard, gainLife, t, tgt } from '../../motor/api.ts';
import { artefatosRecebem } from '../borg.ts';

export default defineCard({
  name: 'Locutus, the One Who Speaks',
  faces: [{
    abilities: [
      artefatosRecebem([{ k: 'pt', p: 1, t: 1 }], 'As criaturas artefato que você controla recebem +1/+1.'),
      // habilidade que funciona na mão (CR 113.6b); a carta descartada é a fonte do dano (CR 113.7a, última informação)
      activated('{W}{B}, Discard this card', function* (c) {
        const id = tgt(c);
        if (id !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 2, combat: false }]);
        gainLife(c.g, c.you, 2, c.source);
      }, { zones: ['hand'], targets: [t.creature()], text: '{W}{B}, Descarte esta carta: Ela causa 2 de dano à criatura alvo. Você ganha 2 de vida.' }),
    ],
  }],
  rulings: {},
});
