import { ITag, ITagAdd } from "@/types/domain/DomainTypes";
import { EntityService } from "./EntityService";

export class TagService extends EntityService<ITag, ITagAdd> {
	constructor() {
		super("tags");
	}
}
