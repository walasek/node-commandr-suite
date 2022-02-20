import { CommandEnvelope, CommandIdentifier, Invoker } from './types';

export class CommandInterceptor extends Invoker {
	constructor(private originalInvoker: Invoker, private handler) {
		super();
	}

	getSupportedCommands(): CommandIdentifier[] {
		return this.originalInvoker.getSupportedCommands();
	}

	async *run(command: CommandEnvelope) {
		return this.handler(...command.args);
	}
}
