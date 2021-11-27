import { AuthorizeCommand } from '~/commands/authorize-command';

describe('AuthorizeCommand', () => {
	test('has a name and a description', () => {
		const testCommand = new AuthorizeCommand();
		expect(testCommand.data.name).toBeTruthy();
		expect(testCommand.data.description).toBeTruthy();
	});
});
