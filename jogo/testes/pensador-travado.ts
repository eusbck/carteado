// Thread de pensar de mentira para os testes da vigia (servidor/pensadores.ts): recebe a tarefa e nunca responde,
// como uma thread presa num laço.
import { parentPort } from 'node:worker_threads';

parentPort!.on('message', () => { /* nunca responde */ });
