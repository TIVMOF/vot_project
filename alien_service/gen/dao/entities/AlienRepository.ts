import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface AlienEntity {
    readonly Id: number;
    Name?: string;
    Planet?: string;
}

export interface AlienCreateEntity {
    readonly Name?: string;
    readonly Planet?: string;
}

export interface AlienUpdateEntity extends AlienCreateEntity {
    readonly Id: number;
}

export interface AlienEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Planet?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Planet?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Planet?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Planet?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Planet?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Planet?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Planet?: string;
        };
    },
    $select?: (keyof AlienEntity)[],
    $sort?: string | (keyof AlienEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AlienEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AlienEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface AlienUpdateEntityEvent extends AlienEntityEvent {
    readonly previousEntity: AlienEntity;
}

export class AlienRepository {

    private static readonly DEFINITION = {
        table: "ALIEN_ALIEN",
        properties: [
            {
                name: "Id",
                column: "ALIEN_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "ALIEN_NAME",
                type: "VARCHAR",
            },
            {
                name: "Planet",
                column: "ALIEN_PLANET",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AlienRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AlienEntityOptions): AlienEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): AlienEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: AlienCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "ALIEN_ALIEN",
            entity: entity,
            key: {
                name: "Id",
                column: "ALIEN_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AlienUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "ALIEN_ALIEN",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "ALIEN_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AlienCreateEntity | AlienUpdateEntity): number {
        const id = (entity as AlienUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AlienUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "ALIEN_ALIEN",
            entity: entity,
            key: {
                name: "Id",
                column: "ALIEN_ID",
                value: id
            }
        });
    }

    public count(options?: AlienEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "ALIEN_ALIEN"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AlienEntityEvent | AlienUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("alien_service-entities-Alien", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("alien_service-entities-Alien").send(JSON.stringify(data));
    }
}
