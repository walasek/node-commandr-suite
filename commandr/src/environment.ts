import { CommandInvokerAlreadyRegistered, CommandInvokerNotFound } from './errors';
import { CommandEnvelope, CommandIdentifier, Invoker } from './types';

export type InvokerCommandMap = { [command: CommandIdentifier]: Invoker };

export class CommandRunningEnvironment {
	private invokerCommandMap: InvokerCommandMap = {};

	handleCommand(envelope: CommandEnvelope) {
		const invoker = this.invokerCommandMap[envelope.command];

		if (!invoker) {
			throw new CommandInvokerNotFound(
				`Command ${envelope.command} could not be run - no compatible invoker registered.`
			);
		}

		return invoker.run(envelope);
	}

	registerInvoker(invoker: Invoker, allowRebinding: boolean = false) {
		const supportedCommands = invoker.getSupportedCommands();

		for (const command of supportedCommands) {
			if (this.invokerCommandMap[command] && !allowRebinding) {
				throw new CommandInvokerAlreadyRegistered(
					`An invoker has already been registered for command ${command}`
				);
			}

			this.invokerCommandMap[command] = invoker;
		}
	}
}
