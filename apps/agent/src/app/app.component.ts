import { AfterViewInit, Component, NgZone, OnInit, Renderer2, HostBinding } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { UntilDestroy } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
	ActivityWatchElectronService,
	AuthStrategy,
	ElectronService,
	LanguageElectronService,
	Store,
	TimeTrackerDateManager
} from '@gauzy/desktop-ui-lib';
import { AppService } from './app.service';

@UntilDestroy({ checkProperties: true })
@Component({
	selector: 'agent-root',
	template: '<router-outlet></router-outlet>',
	styleUrls: ['./app.component.scss'],
	standalone: false
})
export class AppComponent implements OnInit, AfterViewInit {
	@HostBinding('class.login-small-height') isLoginPage = false;

	constructor(
		private electronService: ElectronService,
		private appService: AppService,
		private authStrategy: AuthStrategy,
		public readonly translate: TranslateService,
		private store: Store,
		private toastrService: NbToastrService,
		private _ngZone: NgZone,
		private _renderer: Renderer2,
		readonly activityWatchElectronService: ActivityWatchElectronService,
		readonly languageElectronService: LanguageElectronService
	) {
		activityWatchElectronService.setupActivitiesCollection();
	}

	ngOnInit(): void {
		this.loginStyleOverride();
		this.checkAuthValidation();
		const nebularLinkMedia = document.querySelector('link[media="print"]');
		if (nebularLinkMedia) this._renderer.setAttribute(nebularLinkMedia, 'media', 'all');


		this.electronService.ipcRenderer.send('app_is_init');
	}

	ngAfterViewInit(): void {
		this.languageElectronService.initialize();

		this.electronService.ipcRenderer.on('server_ping', (event, arg) =>
			this._ngZone.run(() => {
				const pingHost = setInterval(async () => {
					try {
						await this.appService.pingServer(arg);
						console.log('Server Found');
						event.sender.send('server_is_ready');
						clearInterval(pingHost);
					} catch (error) {
						console.log('ping status result', error.status);
						if (this.store.userId) {
							event.sender.send('server_is_ready');
							clearInterval(pingHost);
						}
					}
				}, 1000);
			})
		);

		this.electronService.ipcRenderer.on('server_ping_restart', (event, arg) =>
			this._ngZone.run(() => {
				const pingHost = setInterval(async () => {
					try {
						await this.appService.pingServer(arg);
						console.log('Server Found');
						event.sender.send('server_already_start');
						clearInterval(pingHost);
					} catch (error) {
						console.log('ping status result', error.status);
						if (this.store.userId) {
							event.sender.send('server_already_start');
							clearInterval(pingHost);
						}
					}
				}, 3000);
			})
		);

		this.electronService.ipcRenderer.on('__logout__', (_, arg) =>
			this._ngZone.run(async () => {
				try {
					await firstValueFrom(this.authStrategy.logout());
					this.electronService.ipcRenderer.send('navigate_to_login');
					if (arg) this.electronService.ipcRenderer.send('restart_and_update');
				} catch (error) {
					console.log('ERROR', error);
				}
			})
		);

		this.electronService.ipcRenderer.on('social_auth_success', (_, arg) =>
			this._ngZone.run(async () => {
				try {
					this.store.userId = arg.userId;
					this.store.token = arg.token;
					await this.authFromSocial(arg);
				} catch (error) {
					console.log('ERROR', error);
				}
			})
		);
	}

	async authFromSocial(arg) {
		const jwtParsed: any = await this.jwtDecode(arg.token);
		if (jwtParsed) {
			if (jwtParsed.employeeId) {
				const user: any = await this.appService.getUserDetail();
				TimeTrackerDateManager.organization = user?.employee?.organization;
				this.store.organizationId = user?.employee?.organizationId;
				this.store.tenantId = jwtParsed.tenantId;
				this.store.user = user;
				this.electronService.ipcRenderer.send('auth_success', {
					user: user,
					token: arg.token,
					userId: arg.userId,
					employeeId: jwtParsed.employeeId,
					tenantId: jwtParsed.tenantId,
					organizationId: user?.employee?.organizationId
				});
			} else {
				this.toastrService.show('Your account is not an employee', `Warning`, {
					status: 'danger'
				});
			}
		}
	}

	async jwtDecode(token) {
		try {
			return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
		} catch (e) {
			return null;
		}
	}

	loginStyleOverride() {
		const hashPage = location.hash;
		this.isLoginPage = hashPage.includes('auth');
	}

	async checkAuthValidation() {
		const hashPage = location.hash;
		if (hashPage.includes('auth')) {
			try {
				const mainAuth = await this.electronService.ipcRenderer.invoke('CHECK_MAIN_AUTH');
				if (!mainAuth?.token) {
					await firstValueFrom(this.authStrategy.logout());
				}
			} catch(error) {
				console.error('Failed to check main auth:', error);
			}
		}
	}
}
