import { Request, Response, Router } from 'express';
import router from 'express-promise-router';

import { Controller } from './controller';

import { Config } from '~/configurer';

export class CharacterTokenResponseController implements Controller {
	public path = '/wanderers-guide/oauth-callback';

	public router: Router = router();

	public authToken: string = Config.api.secret;

	constructor() {}

	public register(): void {
		this.router.get('/', (req, res) => this.setOauthApiToken(req, res));
	}

	private async setOauthApiToken(req: Request, res: Response): Promise<void> {
		res.status(200).json({ result: 'Success!' });
	}
}
