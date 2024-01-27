namespace ooo.tree {
    export class Calculation_sameToParentRatio extends Calculation {
        public base: string;
        public constructor(column: string, arg: any) {
            super(column, arg);
            this.base = arg.base;
        }
        public calculate(tree: TreeDataView, changes: TreeDataChanges): void {
            let parentIndexes: number[] = [];
            let self = this;

            // common function
            function updateData(index: number) {
                let parentIndex = tree.getParent(index);

                let calculatedValue: number | undefined;

                if (parentIndex != -1) {
                    let parentValue = tree.getData(parentIndex, self.column);
                    let baseParentValue = tree.getData(parentIndex, self.base);
                    let baseValue = tree.getData(index, self.base);

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
                    self.column,
                    calculatedValue);
            }

            // change value
            if (changes.changeValue?.[this.column]) {
                for (let index of changes.changeValue[this.column]) {
                    if (tree.data[index].data[this.column] == undefined) {
                        updateData(index);
                    }
                    parentIndexes.push(index);
                }
            }

            // change levels
            if (changes.level) {
                for (let index of changes.level) {
                    updateData(index);
                    parentIndexes.push(index);
                }
            }

            while (parentIndexes.length > 0) {
                parentIndexes.sort((a, b) => a - b);
                let parentIndex: number = parentIndexes.shift()!;

                let childIndexes = tree.getChildren(parentIndex);
                let parentValue = tree.getData(parentIndex, this.column);
                let parentBaseValue = tree.getData(parentIndex, this.base);

                for (let childIndex of childIndexes) {
                    let originalValue = tree.data[childIndex].data[this.column];
                    let originalCalculatedValue = tree.data[childIndex].calculatedData?.[this.column] ?? undefined;

                    let baseValue = tree.getData(childIndex, this.base);
                    let newValue: number | undefined;
                    if (parentValue != undefined && parentBaseValue != undefined && baseValue != undefined) {
                        newValue = parentValue * baseValue / parentBaseValue;
                    } else {
                        newValue = undefined;
                    }

                    if (originalValue == undefined && originalCalculatedValue != newValue) {
                        parentIndexes.push(childIndex);

                        tree.setCalculatedData(childIndex, this.column, newValue);

                        if (!changes.changeValue) {
                            changes.changeValue = { [this.column]: [childIndex] };
                        } else if (!changes.changeValue[this.column]) {
                            changes.changeValue[this.column] = [];
                        } else {
                            changes.changeValue[this.column].push(childIndex);
                        }
                    }
                }
            }
        }
        public getDepends(): string[] {
            return [this.column];
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

    export class CalculationCreator_sameToParentRatio extends CalculationCreator<Calculation_sameToParentRatio> {
        public create(column: string, args: any): Calculation_sameToParentRatio {
            return new Calculation_sameToParentRatio(column, args);
        }
    }
    CalculationCreatorManager.addCreator("same_to_parent_ratio", new CalculationCreator_sameToParentRatio());
}