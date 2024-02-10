namespace ooo.tree {
    export class Calculation_sameToParent extends Calculation {
        public columnName: string;
        public treeName: string;

        public constructor(public calculationConfig: CalculationConfig) {
            super(calculationConfig);
            [this.treeName, this.columnName] = calculationConfig.arguments.target_column.split(".");
        }

        public calculate(trees: Trees, changes: TreeDataChanges): void {
            let parentIndexes: number[] = [];
            let self = this;

            // get tree. return if error.
            let _tree = trees.getTree(this.treeName);
            if (!_tree) { return; }
            let tree = _tree;

            let treeChange = changes[this.treeName];
            if (!treeChange) { return; }

            // common function
            function updateData(index: number) {
                let parentIndex = tree.getParent(index);
                let calculatedValue: number | undefined;

                if (parentIndex != -1) {
                    calculatedValue = tree.getData(parentIndex, self.columnName);
                } else {
                    // Data of top level item is deleted
                    calculatedValue = undefined;
                }
                tree.setCalculatedData(
                    index,
                    self.columnName,
                    calculatedValue);
            }

            // change value
            if (treeChange.changeValue?.[this.columnName]) {
                for (let index of treeChange.changeValue[this.columnName]) {
                    if (tree.data[index].data[this.columnName] == undefined) {
                        updateData(index);
                    }
                    parentIndexes.push(index);
                }
            }

            // change levels
            if (treeChange.level) {
                for (let index of treeChange.level) {
                    updateData(index);
                    parentIndexes.push(index);
                }
            }

            while (parentIndexes.length > 0) {
                parentIndexes.sort((a, b) => a - b);
                let parentIndex: number = parentIndexes.shift()!;

                let childIndexes = tree.getChildren(parentIndex);
                let value = tree.getData(parentIndex, this.columnName);

                for (let childIndex of childIndexes) {
                    let originalValue = tree.data[childIndex].data[this.columnName];
                    let originalCalculatedValue = tree.data[childIndex].calculatedData?.[this.columnName] ?? undefined;

                    if (originalValue == undefined && originalCalculatedValue != value) {
                        parentIndexes.push(childIndex);

                        tree.setCalculatedData(childIndex, this.columnName, value);

                        if (!treeChange.changeValue) {
                            treeChange.changeValue = { [this.columnName]: [childIndex] };
                        } else if (!treeChange.changeValue[this.columnName]) {
                            treeChange.changeValue[this.columnName] = [];
                        } else {
                            treeChange.changeValue[this.columnName].push(childIndex);
                        }
                    }
                }
            }
        }
    }

    export class CalculationCreator_sameToParent extends CalculationCreator<Calculation_sameToParent> {
        public create(calculationConfig: CalculationConfig): Calculation_sameToParent {
            return new Calculation_sameToParent(calculationConfig);
        }
    }
    CalculationCreatorManager.addCreator("same_to_parent", new CalculationCreator_sameToParent());
}