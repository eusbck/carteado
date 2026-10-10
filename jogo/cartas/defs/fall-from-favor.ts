// Fall from Favor
// Enchant creature
// When this Aura enters, tap enchanted creature and you become the monarch.
// Enchanted creature doesn't untap during its controller's untap step unless that player is the monarch.
import { becomeMonarch, controllerOf, defineCard, etb, lkiObj, staticAbility, t, tap } from '../../motor/api.ts';

export default defineCard({
  name: "Fall from Favor",
  faces: [{
    enchant: t.creature(), abilities: [
      etb(function*(c) { const attached = lkiObj(c.g, c.source)?.attachedTo; if (attached != null) tap(c.g, attached); becomeMonarch(c.g, c.you); }, { text: 'Quando entra, vire a criatura encantada e você se torna o monarca.' }),
      staticAbility({ rules: { cantUntapDuringUntapOf: (c, id, active) => c.g.state.objects[c.source]?.attachedTo === id && controllerOf(c.g, id) === active && c.g.state.monarch !== active }, text: 'A criatura encantada não desvira na etapa de desvirar de seu controlador, a menos que ele seja o monarca.' }),
    ]
  }],
  rulings: {
    "1": "CR 608.2b, 303.4: teste: alvo ilegal impede entrada e não torna ninguém monarca.",
    "2": "CR 725.3: becomeMonarch substitui o monarca anterior; há exatamente um.",
    "3": "CR 725.2: regras do monarca no motor dão a compra no fim e transferem o título por dano de combate.",
    "4": "CR 603.3, 725.2: compra já disparada pertence ao controlador original; testes/regras-veneno-emblema-atordoar.test.ts.",
    "5": "CR 725.4: saída passa o título ao ativo ou ao próximo jogador; testes/regras-veneno-emblema-atordoar.test.ts.",
    "6": "CR 800.4, 725.4: gatilho de jogador eliminado não resolve; transferência de título permanece definida no motor."
  },
});
