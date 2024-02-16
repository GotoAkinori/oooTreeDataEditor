namespace ooo.tree {
    export class Calculation_sumAttributes extends Calculation {
        public attributes: string[];
        public columnName: string;
        public treeName: string;

        public constructor(public calculationConfig: CalculationConfig) {
            super(calculationConfig);
            [this.treeName, this.columnName] = calculationConfig.arguments.target_column.split(".");
            this.attributes = calculationConfig.arguments.attributes;
        }

        public calculate(trees: Trees, changes: TreeDataChanges): void {
            // get tree. return if error.
            let _tree = trees.getTree(this.treeName);
            if (!_tree) { return; }
            let tree = _tree;

            let treeChange = changes[this.treeName];
            if (!treeChange) { return; }

            let indexToUpdate: number[] = [];

            // change values
            for (let attribute of this.attributes) {
                if (treeChange.changeValue?.[attribute]) {
                    indexToUpdate.push(...treeChange.changeValue?.[attribute]);
                }
            }

            // insert row
            if (treeChange.insert) {
                for (let index of treeChange.insert) {
                    indexToUpdate.push(index);
                }
            }

            const indexToUpdateSet = new Set(indexToUpdate);
            indexToUpdate = [...indexToUpdateSet];

            for (let index of indexToUpdate) {
                if (tree.data[index].data[this.columnName] == undefined) {
                    let sum = 0;
                    for (let attribute of this.attributes) {
                        let value = tree.getData(index, attribute) ?? 0;
                        if (typeof (value) == "number") {
                            sum += value;
                        }
                    }
                    tree.setCalculatedData(index, this.columnName, sum);

                    if (!treeChange.changeValue) {
                        treeChange.changeValue = { [this.columnName]: [index] };
                    } else if (!treeChange.changeValue[this.columnName]) {
                        treeChange.changeValue[this.columnName] = [];
                    } else {
                        treeChange.changeValue[this.columnName].push(index);
                    }
                }
            }
        }
    }

    export class CalculationCreator_sumAttributes extends CalculationCreator<Calculation_sumAttributes> {
        public create(calculationConfig: CalculationConfig): Calculation_sumAttributes {
            return new Calculation_sumAttributes(calculationConfig);
        }
    }
    CalculationCreatorManager.addCreator("sum_attribute", new CalculationCreator_sumAttributes());
}