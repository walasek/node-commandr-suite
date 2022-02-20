export type CommandIdentifier = string | number;
export type CommandGeneratorProcedure<T = any> = () => CommandGenerator<T>;
export type CommandGenerator<T = any> = AsyncGenerator<CommandEnvelope, T, any>;

export interface CommandEnvelope<T = any> {
	command: CommandIdentifier;
	args: T;
}

export abstract class Invoker<T = any> {
	getSupportedCommands(): CommandIdentifier[] {
		return [];
	}

	abstract run(command: CommandEnvelope<T>): CommandGenerator;
}

type InvokerCommandMap = { [command: CommandIdentifier]: Invoker };

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

export class CommandInvokerNotFound extends Error {}
export class CommandInvokerAlreadyRegistered extends Error {}

export async function run<T = any>(generator: CommandGenerator<T>, environment: CommandRunningEnvironment) {
	let next: any;
	while (true) {
		const { value, done } = await generator.next(next);
		if (done) return value as T;
		next = await run(environment.handleCommand(value as CommandEnvelope), environment);
	}
}

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
