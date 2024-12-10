// src/person.ts
export class People {
    public roots: string[] = [];
    public data: { [key: string]: Person } = {}

    constructor(data: any) {
        this.data = Object.entries(data)
            .reduce((map, [key, value]) => {
                map[key] = Person.fromJson(value);
                return map;
            }, {} as { [key: string]: Person });

        Object.entries(this.data).forEach(([key, value]) => {
            if (value.parentId && this.data[value.parentId]) {
                this.data[value.parentId].children.push(key)
                this.data[value.parentId].children.sort((a, b) => this.data[a].orderId - this.data[b].orderId)
            } else {
                this.roots.push(key);
            }
        });
    }
}

export default class Person {
    public children: string[] = [];

    constructor(
        public name: string,
        public surname: string,
        public parentId: string | null,
        public orderId: number,
        public dateStart: string,
        public dateEnd: string,
        public description: string,
    ) { }

    static fromJson(data: any) {
        return new Person(
            data['name'],
            data['surname'],
            data['parentId'] ?? null,
            data['orderId'] ?? 0,
            data['dateStart'] ?? '',
            data['dateEnd'] ?? '',
            data['description'] ?? '',
        );
    }
}