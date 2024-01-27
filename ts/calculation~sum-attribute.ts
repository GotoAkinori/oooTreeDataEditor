namespace ooo.tree {
    export class Calculation_sumAttributes extends Calculation {
        public attributes: string[];
        public constructor(column: string, arg: any) {
            super(column, arg);
            this.attributes = arg.attributes;
        }
        public calculate(tree: TreeDataView, change: TreeDataChanges): void {
            let indexToUpdate: number[] = [];
            for (let attribute of this.attributes) {
                if (change.changeValue?.[attribute]) {
                    indexToUpdate.push(...change.changeValue?.[attribute]);
                }
            }

            const indexToUpdateSet = new Set(indexToUpdate);
            indexToUpdate = [...indexToUpdateSet];

            for (let index of indexToUpdate) {
                if (tree.data[index].data[this.column] == undefined) {
                    let sum = 0;
                    for (let attribute of this.attributes) {
                        let value = tree.getData(index, attribute) ?? 0;
                        if (typeof (value) == "number") {
                            sum += value;
                        }
                    }
                    tree.setCalculatedData(index, this.column, sum);

                    if (!change.changeValue) {
                        change.changeValue = { [this.column]: [index] };
                    } else if (!change.changeValue[this.column]) {
                        change.changeValue[this.column] = [];
                    } else {
                        change.changeValue[this.column].push(index);
                    }
                }
            }
        }
        public getDepends(): string[] {
            return this.attributes;
        }
        public getChangeImpact(): { level: boolean; insert: boolean; delete: boolean; move: boolean; } {
            return {
                level: false,
                insert: false,
                delete: false,
                move: false
            }
        }
    }

    export class CalculationCreator_sumAttributes extends CalculationCreator<Calculation_sumAttributes> {
        public create(column: string, args: any): Calculation_sumAttributes {
            return new Calculation_sumAttributes(column, args);
        }
    }
    CalculationCreatorManager.addCreator("sum_attribute", new CalculationCreator_sumAttributes());
}