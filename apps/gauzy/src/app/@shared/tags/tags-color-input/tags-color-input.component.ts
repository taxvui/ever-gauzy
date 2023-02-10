import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	OnDestroy
} from '@angular/core';
import { ITag, IOrganization, PermissionsEnum, ITagCreateInput } from '@gauzy/contracts';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { NbThemeService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import * as randomColor from 'randomcolor';
import { distinctUntilChange } from '@gauzy/common-angular';
import { Store, TagsService } from '../../../@core/services';
import { PictureNameTagsComponent } from '../../table-components';

@UntilDestroy({ checkProperties: true })
@Component({
	selector: 'ga-tags-color-input',
	templateUrl: './tags-color-input.component.html',
	styleUrls: ['./tags-color-input.component.scss']
})
export class TagsColorInputComponent extends PictureNameTagsComponent
	implements OnInit, OnDestroy {

	public subject$: Subject<boolean> = new Subject();
	public hasAddTag$: Observable<boolean>;
	public tags: ITag[] = [];
	public loading: boolean;
	private organization: IOrganization;

	/*
	* Getter & Setter selected tags
	*/
	_selectedTags: ITag[] = [];
	get selectedTags(): ITag[] {
		return this._selectedTags;
	}
	@Input() set selectedTags(value: ITag[]) {
		this._selectedTags = value;
	}

	/*
	* Getter & Setter for check organization level
	*/
	_isOrgLevel: boolean = false;
	get isOrgLevel(): boolean {
		return this._isOrgLevel;
	}
	@Input() set isOrgLevel(value: boolean) {
		this._isOrgLevel = value;
	}

	/*
	* Getter & Setter for check tenant level
	*/
	_isTenantLevel: boolean = false;
	get isTenantLevel(): boolean {
		return this._isTenantLevel;
	}
	@Input() set isTenantLevel(value: boolean) {
		this._isTenantLevel = value;
	}

	/*
	* Getter & Setter for multiple selection
	*/
	_multiple: boolean = true;
	get multiple(): boolean {
		return this._multiple;
	}
	@Input() set multiple(value: boolean) {
		this._multiple = value;
	}

	/*
	* Getter & Setter for display label
	*/
	_label: boolean = true;
	get label(): boolean {
		return this._label;
	}
	@Input() set label(value: boolean) {
		this._label = value;
	}

	/*
	* Getter & Setter for dynamic add tag option
	*/
	_addTag: boolean = true;
	get addTag(): boolean {
		return this._addTag;
	}
	@Input() set addTag(value: boolean) {
		this._addTag = value;
	}

	@Output() selectedTagsEvent = new EventEmitter<ITag[]>();

	constructor(
		private readonly tagsService: TagsService,
		private readonly store: Store,
		public readonly themeService: NbThemeService,
		public readonly translateService: TranslateService
	) {
		super(themeService, translateService);
	}

	ngOnInit(): void {
		this.hasAddTag$ = this.store.userRolePermissions$.pipe(
			map(() =>
				this.store.hasPermission(PermissionsEnum.ORG_TAGS_EDIT)
			)
		);
		this.subject$
			.pipe(
				tap(() => this.getTagsByLevel()),
				untilDestroyed(this)
			)
			.subscribe();
		this.store.selectedOrganization$
			.pipe(
				distinctUntilChange(),
				filter((organization: IOrganization) => !!organization),
				tap((organization: IOrganization) => this.organization = organization),
				tap(() => this.subject$.next(true)),
				untilDestroyed(this)
			)
			.subscribe();
	}

	/**
	 * Get tags by level
	 *
	 * @returns
	 */
	async getTagsByLevel() {
		if (!this.organization) {
			return;
		}
		const { tenantId } = this.store.user;
		const { id: organizationId } = this.organization;

		if (this.isOrgLevel) {
			const { items } = await this.tagsService.getTagsByLevel({
				organizationId,
				tenantId
			});
			this.tags = items;
		}

		if (this.isTenantLevel) {
			const { items } = await this.tagsService.getTagsByLevel({
				tenantId
			});
			this.tags = items;
		}
	}

	/**
	 * Create new tag
	 *
	 * @param name
	 * @returns
	 */
	createNewTag = async (name: ITagCreateInput['name']) => {
		if (!name) {
			return;
		}
		this.loading = true;

		const { tenantId } = this.store.user;
		const { id: organizationId } = this.organization;

		try {
			return await this.tagsService.create({
				name: name,
				color: randomColor(),
				description: '',
				tenantId,
				...(this.isOrgLevel ? { organizationId } : {}),
			});
		} catch (error) {
			console.log('Error while creating tags', error);
		} finally {
			this.loading = false;
		}
	};

	ngOnDestroy(): void { }
}
