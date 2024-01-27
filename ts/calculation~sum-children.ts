namespace ooo.tree {
    export class Calculation_sumChildren extends Calculation {
        public constructor(column: string, arg: any) {
            super(column, arg);
        }
        public calculate(tree: TreeDataView, change: TreeDataChanges): void {
            let indexesToUpdate: number[] = [];

            // update values
            if (change.changeValue?.[this.column]) {
                for (let index of change.changeValue[this.column]) {
                    indexesToUpdate.push(index);
                    let parentIndex = tree.getParent(index);
                    if (parentIndex >= 0) {
                        indexesToUpdate.push(parentIndex);
                    }
                }
            }

            // change levels
            if (change.level) {
                for (let index of change.level) {
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
            if (change.delete) {
                for (let index of change.delete) {
                    let parentIndex = tree.getParent(index);
                    if (parentIndex >= 0) {
                        indexesToUpdate.push(parentIndex);
                    }
                }
            }

            // insert items
            if (change.insert) {
                for (let index of change.insert) {
                    let parentIndex = tree.getParent(index);
                    if (parentIndex >= 0) {
                        indexesToUpdate.push(parentIndex);
                    }
                }
            }

            while (indexesToUpdate.length > 0) {
                indexesToUpdate.sort((a, b) => a - b);
                let updateIndex: number = indexesToUpdate.pop()!;

                let originalValue = tree.data[updateIndex].data[this.column];
                let originalCalculatedValue = tree.data[updateIndex].calculatedData?.[this.column] ?? undefined;

                let result = tree
                    .getChildren(updateIndex)
                    .reduce(
                        (sum, v) => {
                            return sum + (tree.data[v].data[this.column] ?? tree.data[v].calculatedData?.[this.column] ?? 0)
                        },
                        0);

                if (!tree.data[updateIndex].data[this.column] && tree.data[updateIndex].calculatedData?.[this.column] != result) {
                    tree.setCalculatedData(updateIndex, this.column, result);

                    if (originalValue == undefined && originalCalculatedValue != result) {
                        let parentIndex = tree.getParent(updateIndex);
                        if (parentIndex >= 0) {
                            indexesToUpdate.push(tree.getParent(updateIndex));
                        }

                        if (!change.changeValue) {
                            change.changeValue = { [this.column]: [updateIndex] };
                        } else if (!change.changeValue[this.column]) {
                            change.changeValue[this.column] = [];
                        } else {
                            change.changeValue[this.column].push(updateIndex);
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

    export class CalculationCreator_childSum extends CalculationCreator<Calculation_sumChildren> {
        public create(column: string, args: any): Calculation_sumChildren {
            return new Calculation_sumChildren(column, args);
        }
    }
    CalculationCreatorManager.addCreator("sum_children", new CalculationCreator_childSum());
}