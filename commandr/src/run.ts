import { CommandRunningEnvironment } from './environment';
import { CommandEnvelope, CommandGenerator } from './types';

export async function run<T = any>(generator: CommandGenerator<T>, environment: CommandRunningEnvironment) {
	let next: any;
	while (true) {
		const { value, done } = await generator.next(next);
		if (done) return value as T;
		next = await run(environment.handleCommand(value as CommandEnvelope), environment);
	}
}
