namespace ooo.tree {
    export class Calculation_sameToParentRatio extends Calculation {
        public baseColumnName: string;
        public baseTreeName: string;
        public columnName: string;
        public treeName: string;

        public constructor(public calculationConfig: CalculationConfig) {
            super(calculationConfig);
            this.baseColumnName = calculationConfig.arguments.base;
            [this.treeName, this.columnName] = calculationConfig.arguments.target_column.split(".");
            [this.baseTreeName, this.baseColumnName] = calculationConfig.arguments.base.split(".");

            if (this.treeName !== this.baseTreeName) {
                console.warn(`[OOOTREE][Calculation(same_to_parent_ratio)][same_to_parent_ratio] Calculation format is unexpected. Tree of target and base should be the same. (target=${calculationConfig.arguments.target_column}, base=${calculationConfig.arguments.base})`);
            }
        }

        public calculate(trees: Trees, changes: TreeDataChanges): void {
            let parentIndexes: number[] = [];
            let self = this;

            // get tree. return if error.
            let _tree = trees.getTree(this.treeName);
            if (!_tree) { return; }
            let tree = _tree;

            let _baseTree = trees.getTree(this.baseTreeName);
            if (!_baseTree) { return; }
            let baseTree = _baseTree;

            let treeChange = changes[this.treeName];
            if (!treeChange) { return; }

            // common function
            function updateData(index: number) {
                let parentIndex = tree.getParent(index);

                let calculatedValue: number | undefined;

                if (parentIndex != -1) {
                    let parentValue = tree.getData(parentIndex, self.columnName);
                    let baseParentValue = baseTree.getData(parentIndex, self.baseColumnName);
                    let baseValue = baseTree.getData(index, self.baseColumnName);

                    if (parentValue &&
                        baseParentValue &&
                        baseParentValue != 0 &&
                        baseValue
                    ) {
                        calculatedValue = parentValue * baseValue / baseParentValue;
                    } else {
                        calculatedValue = undefined;
                    }
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
            let changeIndex: number[] = [];
            if (treeChange.changeValue?.[this.columnName]) {
                changeIndex.push(...treeChange.changeValue[this.columnName]);
            }
            if (treeChange.changeValue?.[this.baseColumnName]) {
                changeIndex.push(...treeChange.changeValue[this.baseColumnName]);
            }
            const changeIndexSet = new Set(changeIndex);
            changeIndex = [...changeIndexSet];

            for (let index of changeIndex) {
                if (tree.data[index].data[this.columnName] == undefined) {
                    updateData(index);
                }
                parentIndexes.push(index);
            }

            // change levels
            if (treeChange.level) {
                for (let index of treeChange.level) {
                    updateData(index);
                    parentIndexes.push(index);
                }
            }

            // insert row
            if (treeChange.insert) {
                for (let index of treeChange.insert) {
                    updateData(index);
                    parentIndexes.push(index);
                }
            }

            const parentIndexesSet = new Set(parentIndexes);
            parentIndexes = [...changeIndexSet];

            while (parentIndexes.length > 0) {
                parentIndexes.sort((a, b) => a - b);
                let parentIndex: number = parentIndexes.shift()!;

                let childIndexes = tree.getChildren(parentIndex);
                let parentValue = tree.getData(parentIndex, this.columnName);
                let parentBaseValue = baseTree.getData(parentIndex, this.baseColumnName);

                for (let childIndex of childIndexes) {
                    let originalValue = tree.data[childIndex].data[this.columnName];
                    let originalCalculatedValue = tree.data[childIndex].calculatedData?.[this.columnName] ?? undefined;

                    let baseValue = baseTree.getData(childIndex, this.baseColumnName);
                    let newValue: number | undefined;
                    if (parentValue != undefined && parentBaseValue != undefined && baseValue != undefined) {
                        newValue = parentValue * baseValue / parentBaseValue;
                    } else {
                        newValue = undefined;
                    }

                    if (originalValue == undefined && originalCalculatedValue != newValue) {
                        parentIndexes.push(childIndex);

                        tree.setCalculatedData(childIndex, this.columnName, newValue);

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

    export class CalculationCreator_sameToParentRatio extends CalculationCreator<Calculation_sameToParentRatio> {
        public create(calculationConfig: CalculationConfig): Calculation_sameToParentRatio {
            return new Calculation_sameToParentRatio(calculationConfig);
        }
    }
    CalculationCreatorManager.addCreator("same_to_parent_ratio", new CalculationCreator_sameToParentRatio());
}
