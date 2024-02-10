namespace ooo.tree {
    export class CalculationCreatorManager { /* static class */
        private static creators: { [name: string]: ICalculationCreator } = {};
        public static create(calculation: CalculationConfig): Calculation {
            let creator = CalculationCreatorManager.creators[calculation.type];
            if (creator == undefined) {
                throw {
                    message: `The calculation type not exists [${calculation.type}]`
                };
            }
            return creator.create(calculation);
        }
        public static addCreator(type: string, creator: ICalculationCreator) {
            CalculationCreatorManager.creators[type] = creator;
        }
    }

    export class CalculationManager {
        public calculations: Calculation[] = [];
        public constructor(public trees: Trees) { }

        public setCalculation(calculations: CalculationConfig[]) {
            for (let calc of calculations) {
                this.calculations.push(CalculationCreatorManager.create(calc));
            }
        }
        public changeImpact: {
            [key: string]: string[]
        } = {
                "level": [],
                "delete": [],
                "insert": [],
                "move": [],
            };

        public clearCalculation() {
            this.calculations.length = 0;
        }

        public propagateCalculationChangeValue(tree: string, index: number, column: string) {
            this.propagateCalculationBatch({
                [tree]: {
                    changeValue: { [column]: [index] }
                }
            });
        }

        public propagateCalculationChangeLevel(tree: string, index: number) {
            this.propagateCalculationBatch({
                [tree]: {
                    level: [index]
                }
            });
        }

        public propagateCalculationChangeDelete(tree: string, index: number) {
            this.propagateCalculationBatch({
                [tree]: {
                    delete: [index]
                }
            });
        }

        public propagateCalculationChangeInsert(tree: string, index: number) {
            this.propagateCalculationBatch({
                [tree]: {
                    insert: [index]
                }
            });
        }

        public propagateCalculationBatch(changes: TreeDataChanges) {
            for (let calc of this.calculations) {
                calc.calculate(this.trees, changes);
            }
        }
    }

    export abstract class Calculation {
        public depth: number = -1;
        protected constructor(public calculationConfig: CalculationConfig) { this.init(); }
        public abstract calculate(trees: Trees, changes: TreeDataChanges): void;
        public init(): void { };
    }

    export interface ICalculationCreator {
        create(calculation: CalculationConfig): Calculation;
    }

    export abstract class CalculationCreator<T extends Calculation> implements ICalculationCreator {
        public abstract create(calculation: CalculationConfig): T;
    }
}