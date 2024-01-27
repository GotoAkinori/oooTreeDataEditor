namespace ooo.tree {
    export type TreeDataChanges = {
        level?: number[],
        delete?: number[],
        insert?: number[],
        changeValue?: { [column: string]: number[] },
    }

    export class CalculationCreatorManager { /* static class */
        private static creators: { [name: string]: ICalculationCreator } = {};
        public static create(column: string, info: CalculationInfo): Calculation {
            let creator = CalculationCreatorManager.creators[info.type];
            if (creator == undefined) {
                throw {
                    message: `The calculation type not exists [${info.type}]`
                };
            }
            return creator.create(column, info.arguments);
        }
        public static addCreator(type: string, creator: ICalculationCreator) {
            CalculationCreatorManager.creators[type] = creator;
        }
    }

    export class CalculationManager {
        public constructor(public tree: TreeDataView) { }
        public setHeader(columns: ColumnConfig[]) {
            this.depended = {};
            this.depends = {};
            for (let column of columns) {
                this.depended[column.name] = [];
                this.depends[column.name] = [];
            }

            this.clearCalculation();
            for (let column of columns) {
                if (column.calculate) {
                    this.addCalculation(column.name, column.calculate);
                }
            }
            this.addCalculationEnd();
        }
        private calculations: { [name: string]: Calculation } = {};
        public depends: { [column: string]: string[] } = {};
        public depended: { [column: string]: string[] } = {};
        public changeImpact: {
            [key: string]: string[]
        } = {
                "level": [],
                "delete": [],
                "insert": [],
                "move": [],
            };

        public addCalculation(column: string, info: CalculationInfo) {
            try {
                let calculation = CalculationCreatorManager.create(column, info);
                this.calculations[column] = calculation;

                // Dependency
                let depColumns = calculation.getDepends();

                for (let depColumn of depColumns) {
                    if (this.depends[column].indexOf(depColumn) == -1) {
                        this.depends[column].push(depColumn);
                        this.depended[depColumn].push(column);
                    }
                }

                // impact
                let impact = calculation.getChangeImpact();
                for (let changeType of ["level", "insert", "delete", "move"]) {
                    if (impact[changeType]) {
                        this.changeImpact[changeType].push(column);
                    }
                }
            } catch (ev) {
                console.error(ev);
            }
        }

        public addCalculationEnd() {
            let solvedList: string[] = [];
            let loop = true;
            let remain = 0;
            let depth = 1;
            while (loop) {
                loop = false;
                remain = 0;

                for (let column in this.calculations) {
                    if (solvedList.indexOf(column) == -1) {
                        let allDependsChecked = true;
                        for (let depColumn of this.depended[column]) {
                            if (column != depColumn &&
                                this.calculations[depColumn] != undefined &&
                                solvedList.indexOf(depColumn) == -1
                            ) {
                                allDependsChecked = false;
                            }
                        }

                        // if all depending columns are already solved
                        if (allDependsChecked) {
                            solvedList.push(column);
                            this.calculations[column].depth = depth;
                            loop = true;
                        } else {
                            remain++;
                        }
                    } else {
                        continue;
                    }
                }
                if (remain == 0) {
                    return;
                }

                depth++;
            }

            throw {
                message: `calculation dependency loop.`
            };
        }

        public clearCalculation() {
            this.calculations = {};
        }

        public propagateCalculationChangeValue(index: number, column: string) {
            this.propagateCalculationBatch({
                changeValue: { [column]: [index] }
            }, Array.from(this.depended[column]));
        }

        public propagateCalculationChangeLevel(index: number) {
            this.propagateCalculationBatch({
                level: [index]
            }, Array.from(this.changeImpact.level));
        }

        public propagateCalculationBatch(changes: TreeDataChanges, columnsToCalculate: string[]) {
            while (columnsToCalculate.length > 0) {
                // get column with minimam depth
                let column: string = "";
                let columnIndex: number = -1;
                let minDepth = Number.MAX_SAFE_INTEGER;
                for (let index = 0; index < columnsToCalculate.length; index++) {
                    if (this.calculations[columnsToCalculate[index]].depth < minDepth) {
                        column = columnsToCalculate[index];
                        minDepth = this.calculations[column].depth;
                        columnIndex = index;
                    }
                }

                if (columnIndex >= 0) {
                    columnsToCalculate.splice(columnIndex, 1);
                } else {
                    break;
                }

                this.calculations[column].calculate(this.tree, changes);

                if (changes.changeValue &&
                    changes.changeValue[column] &&
                    changes.changeValue[column].length > 0
                ) {
                    for (let dependedColumn of this.depended[column]) {
                        if (dependedColumn != column && columnsToCalculate.indexOf(dependedColumn) == -1) {
                            columnsToCalculate.push(dependedColumn);
                        }
                    }
                }
            }
        }
    }

    export abstract class Calculation {
        public depth: number = -1;
        protected constructor(public column: string, public args: any) { this.init(); }
        public abstract calculate(tree: TreeDataView, changes: TreeDataChanges): void;
        public abstract getDepends(): string[];
        public abstract getChangeImpact(): {
            [key: string]: boolean
        };
        public init(): void { };
    }

    export interface ICalculationCreator {
        create(column: string, args: any): Calculation;
    }

    export abstract class CalculationCreator<T extends Calculation> implements ICalculationCreator {
        public abstract create(column: string, args: any): T;
    }
}