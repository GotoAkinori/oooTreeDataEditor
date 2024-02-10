namespace ooo.tree {
    export class Trees {
        private trees: { name: string, tree: TreeDataView }[] = [];
        private calculationManager: CalculationManager = new CalculationManager(this);

        public constructor(public formatName: string) { }

        public getTree(name: string) {
            let sheet = this.trees.find(v => v.name == name);
            return sheet?.tree ?? undefined;
        }

        public getData() {
            return {
                trees: this.trees.map(v => {
                    return {
                        name: v.name,
                        data: v.tree.data
                    }
                }),
                format: this.formatName
            }
        }

        public setData(data: TreeData) {
            for (let treeData of data.trees) {
                let tree = this.trees.find(v => v.name == treeData.name);
                if (tree == undefined) { continue; }
                tree.tree.setTableData(treeData.data);
            }
        }

        public setFormat(format: TreeFormat) {
            for (let treeConfig of format.trees) {
                let tree = this.trees.find(v => v.name == treeConfig.name);
                if (tree == undefined) { continue; }
                tree.tree.setColumns(treeConfig.columns);
            }

            this.calculationManager.setCalculation(format.calculations);
        }

        public addTrees(name: string,
            table: HTMLTableElement,
            table_header: HTMLTableSectionElement,
            table_body: HTMLTableSectionElement
        ) {
            this.trees.push({
                name: name,
                tree: new TreeDataView(
                    name,
                    table,
                    table_header,
                    table_body,
                    this.calculationManager)
            });
        }

        public initData() {
            let changes: TreeDataChanges = {};

            for (let tree of this.trees) {
                changes[tree.name] = { changeValue: {} };
                for (let column of tree.tree.columns) {
                    let indexes: number[] = [];
                    for (let i = 0; i < tree.tree.data.length; i++) {
                        indexes.push(i);
                    }

                    changes[tree.name].changeValue![column.name] = indexes;
                }
            }

            this.calculationManager.propagateCalculationBatch(changes);
        }
    }
}