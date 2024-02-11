declare namespace ooo.tree {
    class CalculationCreatorManager {
        private static creators;
        static create(calculation: CalculationConfig): Calculation;
        static addCreator(type: string, creator: ICalculationCreator): void;
    }
    class CalculationManager {
        trees: Trees;
        calculations: Calculation[];
        constructor(trees: Trees);
        setCalculation(calculations: CalculationConfig[]): void;
        changeImpact: {
            [key: string]: string[];
        };
        clearCalculation(): void;
        propagateCalculationChangeValue(tree: string, index: number, column: string): void;
        propagateCalculationChangeLevel(tree: string, index: number): void;
        propagateCalculationChangeDelete(tree: string, index: number): void;
        propagateCalculationChangeInsert(tree: string, index: number): void;
        propagateCalculationBatch(changes: TreeDataChanges): void;
    }
    abstract class Calculation {
        calculationConfig: CalculationConfig;
        depth: number;
        protected constructor(calculationConfig: CalculationConfig);
        abstract calculate(trees: Trees, changes: TreeDataChanges): void;
        init(): void;
    }
    interface ICalculationCreator {
        create(calculation: CalculationConfig): Calculation;
    }
    abstract class CalculationCreator<T extends Calculation> implements ICalculationCreator {
        abstract create(calculation: CalculationConfig): T;
    }
}
declare namespace ooo.tree {
    class Calculation_sameToParentRatio extends Calculation {
        calculationConfig: CalculationConfig;
        baseColumnName: string;
        baseTreeName: string;
        columnName: string;
        treeName: string;
        constructor(calculationConfig: CalculationConfig);
        calculate(trees: Trees, changes: TreeDataChanges): void;
    }
    class CalculationCreator_sameToParentRatio extends CalculationCreator<Calculation_sameToParentRatio> {
        create(calculationConfig: CalculationConfig): Calculation_sameToParentRatio;
    }
}
declare namespace ooo.tree {
    class Calculation_sameToParent extends Calculation {
        calculationConfig: CalculationConfig;
        columnName: string;
        treeName: string;
        constructor(calculationConfig: CalculationConfig);
        calculate(trees: Trees, changes: TreeDataChanges): void;
    }
    class CalculationCreator_sameToParent extends CalculationCreator<Calculation_sameToParent> {
        create(calculationConfig: CalculationConfig): Calculation_sameToParent;
    }
}
declare namespace ooo.tree {
    class Calculation_sumAttributes extends Calculation {
        calculationConfig: CalculationConfig;
        attributes: string[];
        columnName: string;
        treeName: string;
        constructor(calculationConfig: CalculationConfig);
        calculate(trees: Trees, changes: TreeDataChanges): void;
        getDepends(): string[];
        getChangeImpact(): {
            level: boolean;
            insert: boolean;
            delete: boolean;
            move: boolean;
        };
    }
    class CalculationCreator_sumAttributes extends CalculationCreator<Calculation_sumAttributes> {
        create(calculationConfig: CalculationConfig): Calculation_sumAttributes;
    }
}
declare namespace ooo.tree {
    class Calculation_sumChildren extends Calculation {
        calculationConfig: CalculationConfig;
        attributes: string[];
        columnName: string;
        treeName: string;
        constructor(calculationConfig: CalculationConfig);
        calculate(trees: Trees, changes: TreeDataChanges): void;
        getDepends(): string[];
        getChangeImpact(): {
            level: boolean;
            insert: boolean;
            delete: boolean;
            move: boolean;
        };
    }
    class CalculationCreator_childSum extends CalculationCreator<Calculation_sumChildren> {
        create(calculationConfig: CalculationConfig): Calculation_sumChildren;
    }
}
declare namespace ooo.tree {
    interface ICellDataManager {
        toJsonData(cell: HTMLTableCellElement | HTMLSpanElement): any;
        fromJsonData(cell: HTMLTableCellElement | HTMLSpanElement, data: any): void;
        editCell(tree: TreeDataView, cell: HTMLTableCellElement | HTMLSpanElement, originalData: any, calculatedData: any, onEnd: (data: any) => void, option?: EditCellOption, ev?: KeyboardEvent): void;
        getDefaultValue(): any;
        setValue(cell: HTMLTableCellElement | HTMLSpanElement, newValue: any, calculatedValue: any): any;
        setCalculatedValue(cell: HTMLTableCellElement | HTMLSpanElement, newCalculatedValue: any, value: any): any;
    }
    abstract class CellDataManager<T_DATA, T_JSON> implements ICellDataManager {
        abstract setValue(cell: HTMLTableCellElement | HTMLSpanElement, newValue: T_DATA, currentValue: T_DATA | undefined): any;
        abstract setCalculatedValue(cell: HTMLTableCellElement | HTMLSpanElement, newCalculatedValue: T_DATA | undefined, value: T_DATA): any;
        abstract toJsonData(cell: HTMLTableCellElement | HTMLSpanElement): T_JSON;
        abstract fromJsonData(cell: HTMLTableCellElement | HTMLSpanElement, data: T_JSON): void;
        abstract getDefaultValue(): T_DATA;
        abstract editCell(tree: TreeDataView, cell: HTMLTableCellElement | HTMLSpanElement, originalData: T_DATA, calculatedData: T_DATA | undefined, onEnd: (data: T_DATA) => void, option?: EditCellOption, ev?: KeyboardEvent): void;
    }
    class CellDataManagerUtil {
        static onEditWithInput<T_DATA>(tree: TreeDataView, cell: HTMLTableCellElement | HTMLSpanElement, events: {
            onEnd?: (data: string) => void;
            onCancel?: () => void;
        }, type: string, option?: EditCellOption, ev?: KeyboardEvent): void;
    }
    interface ICellDataManagerCreator {
        create(): ICellDataManager;
    }
    abstract class CellDataManagerCreator<T extends ICellDataManager> {
        abstract create(): T;
    }
    function addCellDataCreator(type: string, creator: ICellDataManagerCreator): void;
    function getCellDataCreator(type: string): ICellDataManagerCreator;
}
declare namespace ooo.tree {
}
declare namespace ooo.tree {
}
declare namespace ooo.tree {
    export class TreeDataView {
        name: string;
        table: HTMLTableElement;
        table_header: HTMLTableSectionElement;
        table_body: HTMLTableSectionElement;
        calculationManager: CalculationManager;
        columns: ColumnConfig[];
        iconPath: string;
        data: TreeDataItem[];
        cellDataManagers: {
            [column: string]: ICellDataManager;
        };
        event: {
            [target: string]: Function[];
        };
        addEvent(name: string, func: Function): void;
        fireEvent(name: string, arg: any): void;
        constructor(name: string, table: HTMLTableElement, table_header: HTMLTableSectionElement, table_body: HTMLTableSectionElement, calculationManager: CalculationManager);
        setIconPath(path: string): void;
        setColumns(columns: ColumnConfig[]): void;
        setTableData(data: TreeDataItem[]): void;
        getTableData(): TreeDataItem[];
        hasChild(itemIndex: number): boolean;
        getWidth(): number;
        getHeight(): number;
        getRow(index: number): HTMLTableRowElement;
        getCell(row: number, col: number): HTMLTableCellElement;
        getEditArea(row: number, col: number): HTMLSpanElement;
        getTreeCell(index: number): HTMLTableCellElement;
        getTreeType(treeCell: HTMLTableCellElement): TreeCellType;
        setTreeType(treeCell: HTMLTableCellElement, type: TreeCellType): void;
        getLevel(index: number): number;
        hideRow(index: number): void;
        showRow(index: number): void;
        setVisible(start: number, end: number): void;
        getChildRange(index: number): number;
        contains(element: Element | null): boolean;
        addTreeCell(row: HTMLTableRowElement, col: ColumnConfig, data: string, level: number, type: TreeCellType): void;
        addCell(row: HTMLTableRowElement, col: ColumnConfig, data: string): void;
        getParent(index: number): number;
        getParentPath(index: number): number[];
        getChildren(index: number): number[];
        getData(index: number, column: string): any;
        setCalculatedData(index: number, column: string, value: any): void;
        setData(index: number, column: string, value: any): void;
        clearData(index: number, column: string): void;
        editing: boolean;
        onInit_edit(): void;
        onAfterSetHeader_edit(columns: ColumnConfig[]): void;
        edit(cell: HTMLTableCellElement | HTMLSpanElement, column: string, keepValue: boolean, ev?: KeyboardEvent): void;
        addRow(row: HTMLTableRowElement): void;
        removeRow(row: HTMLTableRowElement): void;
        setLevel(index: number, level: number): void;
        switch(index: number): void;
        close(index: number): void;
        open(index: number): void;
        isActive: boolean;
        selectionRange: Rect;
        currentCell: Pos;
        shiftSelectEnd: Pos;
        private dragging;
        private getTableRange;
        private onAfterSetHeader_selection;
        private onAfterSetTableData_selection;
        onInit_selection(): void;
        private onMouseDown_selection;
        private onMouseOver_selection;
        currentCell_moveTo(row: number, col: number): void;
        selectionRange_change(left: number, top: number, right: number, bottom: number): void;
        onAfterEdit_calculation(cell: HTMLTableCellElement | HTMLSpanElement, before: any, after: any): void;
        onChangeLevel_calculation(rowIndex: number, before: number, after: number): void;
        onInsertRow_calculation(rowIndex: number): void;
        onDeleteRow_calculation(rowIndex: number): void;
        onAfterSetTableData_calculation(): void;
    }
    class Rect {
        left: number;
        top: number;
        right: number;
        bottom: number;
        constructor(left: number, top: number, right: number, bottom: number);
        static getRect(p1: Pos, p2: Pos): Rect;
        moveTo(left: number, top: number, right?: number, bottom?: number): void;
        intersect(rect: Rect): void;
        forEach(): Generator<{
            row: number;
            col: number;
        }>;
    }
    class Pos {
        row: number;
        col: number;
        constructor(row: number, col: number);
        moveTo(row: number, col: number): void;
        moveInto(rect: Rect): void;
        isIn(rect: Rect): boolean;
    }
    export {};
}
declare namespace ooo.tree {
    class Trees {
        formatName: string;
        private trees;
        private calculationManager;
        constructor(formatName: string);
        getTree(name: string): TreeDataView | undefined;
        getData(): {
            trees: {
                name: string;
                data: TreeDataItem[];
            }[];
            format: string;
        };
        setData(data: TreeData): void;
        setFormat(format: TreeFormat): void;
        addTrees(name: string, table: HTMLTableElement, table_header: HTMLTableSectionElement, table_body: HTMLTableSectionElement): void;
        initData(): void;
    }
}
declare namespace ooo.tree {
    type ColumnConfig = {
        name: string;
        caption: string;
        value_type: string;
        default_value?: any;
        readonly?: boolean;
    };
    type CalculationConfig = {
        type: string;
        arguments: any;
    };
    type FormatConfig = {
        name: string;
        tree_col: string;
        id_col: string;
        parent_key: string;
        columns: ColumnConfig[];
    };
    type TreeDataItem = {
        level: number;
        open?: boolean;
        data: {
            [column: string]: any;
        };
        calculatedData?: {
            [column: string]: any;
        };
    };
    type TreeCellType = "open" | "closed" | "none";
    type CalculationInfo = {
        type: string;
        arguments: any;
    };
    type TreeDataChanges = {
        [tree: string]: {
            level?: number[];
            delete?: number[];
            insert?: number[];
            changeValue?: {
                [column: string]: number[];
            };
        };
    };
    type TreeFormat = {
        version: string;
        name: string;
        trees: {
            name: string;
            columns: ColumnConfig[];
        }[];
        calculations: CalculationInfo[];
    };
    type TreeData = {
        format: string;
        trees: {
            name: string;
            data: TreeDataItem[];
        }[];
    };
    type EditCellOption = {
        keepValue?: boolean;
    };
}
//# sourceMappingURL=tree.d.ts.map