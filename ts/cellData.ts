namespace ooo.tree {
    export interface ICellDataManager {
        toJsonData(cell: HTMLTableCellElement | HTMLSpanElement): any;
        fromJsonData(cell: HTMLTableCellElement | HTMLSpanElement, data: any): void;

        editCell(
            tree: TreeDataView,
            cell: HTMLTableCellElement | HTMLSpanElement,
            originalData: any,
            calculatedData: any,
            onEnd: (data: any) => void,
            option?: EditCellOption,
            ev?: KeyboardEvent
        ): void;
        getDefaultValue(): any;
        setValue(
            cell: HTMLTableCellElement | HTMLSpanElement,
            newValue: any, calculatedValue: any
        ): any;
        setCalculatedValue(
            cell: HTMLTableCellElement | HTMLSpanElement,
            newCalculatedValue: any, value: any
        ): any;
    }

    export abstract class CellDataManager<T_DATA, T_JSON> implements ICellDataManager {
        public abstract setValue(cell: HTMLTableCellElement | HTMLSpanElement, newValue: T_DATA, currentValue: T_DATA | undefined): any;
        public abstract setCalculatedValue(cell: HTMLTableCellElement | HTMLSpanElement, newCalculatedValue: T_DATA | undefined, value: T_DATA): any;
        public abstract toJsonData(cell: HTMLTableCellElement | HTMLSpanElement): T_JSON;
        public abstract fromJsonData(cell: HTMLTableCellElement | HTMLSpanElement, data: T_JSON): void;
        public abstract getDefaultValue(): T_DATA;

        public abstract editCell(
            tree: TreeDataView,
            cell: HTMLTableCellElement | HTMLSpanElement,
            originalData: T_DATA,
            calculatedData: T_DATA | undefined,
            onEnd: (data: T_DATA) => void,
            option?: EditCellOption,
            ev?: KeyboardEvent
        ): void;
    }

    export class CellDataManagerUtil { /* static */
        public static onEditWithInput<T_DATA>(
            tree: TreeDataView,
            cell: HTMLTableCellElement | HTMLSpanElement,
            events: {
                onEnd?: (data: string) => void,
                onCancel?: () => void
            },
            type: string,
            option?: EditCellOption,
            ev?: KeyboardEvent
        ) {
            let input = document.createElement("input");
            let canceled = false;
            let inputRemoved = false;

            tree.editing = true;

            input.value = option?.keepValue ? cell.innerText : "";
            input.type = type;
            cell.innerHTML = "";
            cell.append(input);
            input.focus();

            function editEnd() {
                if (canceled) { return; }
                if (inputRemoved) { return; }
                inputRemoved = true;

                let newData = input.value;
                input.remove();
                if (events.onEnd) {
                    events.onEnd(newData);
                }
                tree.editing = false;
            }

            function editCancel() {
                canceled = true;
                input.remove();
                if (events.onCancel) {
                    events.onCancel();
                }
                tree.editing = false;
            }

            input.addEventListener("keydown", (ev) => {
                switch (ev.key) {
                    case "Enter": {
                        editEnd();
                    } break;
                    case "Escape": {
                        editCancel();
                    } break;
                    default: {
                        // console.log(ev.code);
                        // console.log(ev.key);
                    } break;
                }
            });
            input.addEventListener("blur", editEnd);
        }
    }

    export interface ICellDataManagerCreator {
        create(): ICellDataManager;
    }

    export abstract class CellDataManagerCreator<T extends ICellDataManager> {
        public abstract create(): T;
    }

    let creators: { [type: string]: ICellDataManagerCreator } = {};

    export function addCellDataCreator(type: string, creator: ICellDataManagerCreator) {
        creators[type] = creator;
    }
    export function getCellDataCreator(type: string) {
        let creator = creators[type ?? "string"];
        if (creator) {
            return creator;
        } else {
            throw {
                message: `Unknown cell data type [${type}]`
            };
        }
    }
}