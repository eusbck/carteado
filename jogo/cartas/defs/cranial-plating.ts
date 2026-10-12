// Cranial Plating
// Equipped creature gets +1/+0 for each artifact you control.
// {B}{B}: Attach this Equipment to target creature you control.
// Equip {1}
import { activated, attach, attachedGets, defineCard, equip, is, t, tgt } from '../../motor/api.ts';
import { artefatosDe } from '../wakanda.ts';

export default defineCard({
  name: 'Cranial Plating',
  faces: [{
    abilities: [
      // ruling 1: conta a si mesma
      attachedGets((c) => { const n = artefatosDe(c.g, c.you).length; return n > 0 ? [{ k: 'pt', p: n, t: 0 }] : []; }, 'A criatura equipada recebe +1/+0 para cada artefato que você controla.'),
      // ruling 2: não é equipar; pode ser ativada a qualquer momento em que você poderia conjurar uma instantânea
      activated('{B}{B}', function* (c) {
        const id = tgt(c);
        if (id !== null && c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, c.source, id);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: '{B}{B}: Anexe este Equipamento à criatura alvo que você controla.' }),
      equip('{1}'),
    ],
  }],
  rulings: {
    1: 'teste: a equipada recebe +1/+0 por artefato seu, contando a própria Cranial Plating',
    2: 'teste: {B}{B} anexa em velocidade de instantânea, até no turno de outro jogador',
  },
});