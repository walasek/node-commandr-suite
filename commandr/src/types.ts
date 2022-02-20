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
