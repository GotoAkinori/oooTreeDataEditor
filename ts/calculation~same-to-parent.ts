namespace ooo.tree {
    export class Calculation_sameToParent extends Calculation {
        public constructor(column: string, arg: any) {
            super(column, arg);
        }
        public calculate(tree: TreeDataView, changes: TreeDataChanges): void {
            let parentIndexes: number[] = [];
            let self = this;

            // common function
            function updateData(index: number) {
                let parentIndex = tree.getParent(index);
                let calculatedValue: number | undefined;

                if (parentIndex != -1) {
                    calculatedValue = tree.getData(parentIndex, self.column);
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
                let value = tree.getData(parentIndex, this.column);

                for (let childIndex of childIndexes) {
                    let originalValue = tree.data[childIndex].data[this.column];
                    let originalCalculatedValue = tree.data[childIndex].calculatedData?.[this.column] ?? undefined;

                    if (originalValue == undefined && originalCalculatedValue != value) {
                        parentIndexes.push(childIndex);

                        tree.setCalculatedData(childIndex, this.column, value);

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

    export class CalculationCreator_sameToParent extends CalculationCreator<Calculation_sameToParent> {
        public create(column: string, args: any): Calculation_sameToParent {
            return new Calculation_sameToParent(column, args);
        }
    }
    CalculationCreatorManager.addCreator("same_to_parent", new CalculationCreator_sameToParent());
}