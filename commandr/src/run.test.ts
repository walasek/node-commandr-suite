import { run } from './run';
import { CommandRunningEnvironment } from './environment';
import { CommandEnvelope, CommandGeneratorProcedure, CommandIdentifier, Invoker } from './types';

class TestCommandInvoker extends Invoker {
	constructor(private fn) {
		super();
	}

	getSupportedCommands(): CommandIdentifier[] {
		return ['test'];
	}

	async *run(command: CommandEnvelope<TestCommandArguments>) {
		return this.fn(command.args.arg1, command.args.arg2);
	}
}

interface TestCommandArguments {
	arg1: string;
	arg2: number;
}

function testCommand(arg1: string, arg2: number): CommandEnvelope<TestCommandArguments> {
	return { command: 'test', args: { arg1, arg2 } };
}

describe('Commandr suite', () => {
	let env: CommandRunningEnvironment;

	beforeEach(() => {
		env = new CommandRunningEnvironment();
	});

	it('allows running generators', async () => {
		const fn = jest.fn();
		const myProcedure = async function* () {
			fn();
		};

		run(myProcedure(), env);
	});

	it('allows running commands against invokers', async () => {
		const fn = jest.fn();
		const myProcedure: CommandGeneratorProcedure<number> = async function* () {
			return yield testCommand('abc', 123);
		};
		env.registerInvoker(new TestCommandInvoker(fn));
		fn.mockReturnValue(123);

		const result = await run(myProcedure(), env);

		expect(result).toEqual(123);
		expect(fn).toHaveBeenCalledWith('abc', 123);
	});
});
