namespace ooo.tree {
    export type ColumnConfig = {
        name: string,
        caption: string,
        value_type: string,
        default_value?: any,
        readonly?: boolean,
    };

    export type CalculationConfig = {
        type: string,
        arguments: any,
    };

    export type FormatConfig = {
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

    export type TreeDataChanges = {
        [tree: string]: {
            level?: number[],
            delete?: number[],
            insert?: number[],
            changeValue?: { [column: string]: number[] },
        }
    }

    export type TreeFormat = {
        version: string,
        name: string,
        trees: { name: string, columns: ColumnConfig[] }[],
        calculations: CalculationInfo[]
    }

    export type TreeData = {
        format: string,
        trees: {
            name: string,
            data: TreeDataItem[]
        }[]
    }

    export type EditCellOption = {
        keepValue?: boolean
    }
}