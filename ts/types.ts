namespace ooo.tree {
    export type ColumnConfig = {
        name: string,
        caption: string,
        value_type: string,
        default_value?: any,
        readonly?: boolean,
        calculate?: CalculationInfo
    };
    export type FormatConfig = {
        name: string,
        tree_col: string,
        id_col: string,
        parent_key: string,
        columns: ColumnConfig[]
    };
    export type TreeDataItem = {
        level: number,
        open?: boolean,
        data: { [column: string]: any },
        calculatedData?: { [column: string]: any }
    }
    export type TreeCellType = "open" | "closed" | "none";

    export type CalculationInfo = {
        type: string,
        arguments: any
    }
}