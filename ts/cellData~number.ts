namespace ooo.tree {
    class CellDataManager_number extends CellDataManager<number | undefined, number | undefined>{
        public setValue(cell: HTMLTableCellElement | HTMLSpanElement, newValue: number | undefined, calculatedValue: number | undefined) {
            if (newValue != undefined) {
                cell.classList.remove("calculated");
                cell.innerText = newValue.toString();
            } else {
                cell.classList.add("calculated");
                cell.innerText = calculatedValue?.toString() ?? "";
            }
        }
        public setCalculatedValue(cell: HTMLTableCellElement | HTMLSpanElement, newCalculatedValue: number | undefined, value: number | undefined) {
            if (!value) {
                cell.classList.add("calculated");
                cell.innerText = newCalculatedValue?.toString() ?? "";
            }
        }
        public toJsonData(cell: HTMLTableCellElement | HTMLSpanElement): number {
            return Number(cell.innerText);
        }
        public fromJsonData(cell: HTMLTableCellElement | HTMLSpanElement, data: number | undefined): void {
            cell.innerText = data ? data.toString() : "";
        }
        public editCell(
            tree: TreeDataView,
            cell: HTMLTableCellElement | HTMLSpanElement,
            originalData: number | undefined,
            calculatedData: number | undefined,
            onEnd: (data: number | undefined) => void,
            option?: EditCellOption,
            ev?: KeyboardEvent
        ): void {
            CellDataManagerUtil.onEditWithInput(
                tree,
                cell,
                {
                    onEnd: (data) => {
                        let value = data == "" ? undefined : Number(data);
                        this.setValue(cell, value, calculatedData);
                        onEnd(value);
                    },
                    onCancel: () => {
                        cell.innerText = originalData?.toString() ?? "";
                    }
                },
                "number",
                option,
                ev
            )
        }
        public getDefaultValue(): number | undefined {
            return undefined;
        }
    }

    class CellDataManagerCreator_number extends CellDataManagerCreator<CellDataManager_number> {
        public create(): CellDataManager_number {
            return new CellDataManager_number();
        }
    }

    addCellDataCreator("number", new CellDataManagerCreator_number());
}