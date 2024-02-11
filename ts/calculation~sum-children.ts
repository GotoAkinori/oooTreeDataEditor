namespace ooo.tree {
    export class Calculation_sumChildren extends Calculation {
        public attributes: string[];
        public columnName: string;
        public treeName: string;

        public constructor(public calculationConfig: CalculationConfig) {
            super(calculationConfig);
            [this.treeName, this.columnName] = calculationConfig.arguments.target_column.split(".");
            this.attributes = calculationConfig.arguments.attributes;
        }

        public calculate(trees: Trees, changes: TreeDataChanges): void {
            let indexesToUpdate: number[] = [];

            // get tree. return if error.
            let _tree = trees.getTree(this.treeName);
            if (!_tree) { return; }
            let tree = _tree;

            let treeChange = changes[this.treeName];
            if (!treeChange) { return; }

            // update values
            if (treeChange.changeValue?.[this.columnName]) {
                for (let index of treeChange.changeValue[this.columnName]) {
                    indexesToUpdate.push(index);
                    let parentIndex = tree.getParent(index);
                    if (parentIndex >= 0) {
                        indexesToUpdate.push(parentIndex);
                    }
                }
            }

            // change levels
            if (treeChange.level) {
                for (let index of treeChange.level) {
                    indexesToUpdate.push(index);
                    let parentIndex = tree.getParent(index);
                    if (parentIndex >= 0) {
                        indexesToUpdate.push(parentIndex);
                    }
                    if (index > 0) {
                        let prevParentIndex = tree.getParent(index - 1);
                        if (prevParentIndex >= 0) {
                            indexesToUpdate.push(prevParentIndex);
                        }
                    }
                }
            }

            // delete items
            if (treeChange.delete) {
                for (let index of treeChange.delete) {
                    let parentIndex = tree.getParent(index - 1);
                    if (parentIndex >= 0) {
                        indexesToUpdate.push(parentIndex);
                    }
                }
            }

            // insert items
            if (treeChange.insert) {
                for (let index of treeChange.insert) {
                    let parentIndex = tree.getParent(index - 1);
                    if (parentIndex >= 0) {
                        indexesToUpdate.push(parentIndex);
                    }
                }
            }

            while (indexesToUpdate.length > 0) {
                indexesToUpdate.sort((a, b) => a - b);
                let updateIndex: number = indexesToUpdate.pop()!;

                let originalValue = tree.data[updateIndex].data[this.columnName];
                let originalCalculatedValue = tree.data[updateIndex].calculatedData?.[this.columnName] ?? undefined;

                let result = tree
                    .getChildren(updateIndex)
                    .reduce(
                        (sum, v) => {
                            return sum + (tree.data[v].data[this.columnName] ?? tree.data[v].calculatedData?.[this.columnName] ?? 0)
                        },
                        0);

                if (!tree.data[updateIndex].data[this.columnName] && tree.data[updateIndex].calculatedData?.[this.columnName] != result) {
                    tree.setCalculatedData(updateIndex, this.columnName, result);

                    if (originalValue == undefined && originalCalculatedValue != result) {
                        let parentIndex = tree.getParent(updateIndex);
                        if (parentIndex >= 0) {
                            indexesToUpdate.push(tree.getParent(updateIndex));
                        }

                        if (!treeChange.changeValue) {
                            treeChange.changeValue = { [this.columnName]: [updateIndex] };
                        } else if (!treeChange.changeValue[this.columnName]) {
                            treeChange.changeValue[this.columnName] = [];
                        } else {
                            treeChange.changeValue[this.columnName].push(updateIndex);
                        }
                    }
                }
            }
        }

        public getDepends(): string[] {
            return [this.columnName];
        }
        public getChangeImpact(): { level: boolean; insert: boolean; delete: boolean; move: boolean; } {
            return {
                level: true,
                insert: false,
                delete: true,
                move: false
            }
        }
    }

    export class CalculationCreator_childSum extends CalculationCreator<Calculation_sumChildren> {
        public create(calculationConfig: CalculationConfig): Calculation_sumChildren {
            return new Calculation_sumChildren(calculationConfig);
        }
    }
    CalculationCreatorManager.addCreator("sum_children", new CalculationCreator_childSum());
}