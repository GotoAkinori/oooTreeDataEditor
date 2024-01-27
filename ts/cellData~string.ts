namespace ooo.tree {
    class CellDataManager_string extends CellDataManager<string, string>{
        public setValue(cell: HTMLTableCellElement | HTMLSpanElement, newValue: string, calculatedValue: string | undefined) {
            if (newValue != "") {
                cell.classList.remove("calculated");
                cell.innerText = newValue;
            } else {
                cell.classList.add("calculated");
                cell.innerText = calculatedValue ?? "";
            }
        }
        public setCalculatedValue(cell: HTMLTableCellElement | HTMLSpanElement, newCalculatedValue: string | undefined, currentValue: string) {
            if (!currentValue) {
                cell.classList.add("calculated");
                cell.innerText = newCalculatedValue ?? "";
            }
        }
        public toJsonData(cell: HTMLTableCellElement | HTMLSpanElement): string {
            return cell.innerText;
        }
        public fromJsonData(cell: HTMLTableCellElement | HTMLSpanElement, data: string): void {
            cell.innerText = data;
        }
        public editCell(
            tree: TreeDataView,
            cell: HTMLTableCellElement | HTMLSpanElement,
            originalData: string,
            calculatedData: string | undefined,
            onEnd: (data: string) => void,
            ev: KeyboardEvent): void {
            CellDataManagerUtil.onEditWithInput(
                tree,
                cell,
                {
                    onEnd: (data) => {
                        this.setValue(cell, data, calculatedData);
                        onEnd(data);
                    },
                    onCancel: () => {
                        cell.innerText = originalData;
                    }
                },
                "text",
                ev
            )
        }
        public getDefaultValue(): string {
            return "";
        }
    }

    class CellDataManagerCreator_string extends CellDataManagerCreator<CellDataManager_string> {
        public create(): CellDataManager_string {
            return new CellDataManager_string();
        }
    }

    addCellDataCreator("string", new CellDataManagerCreator_string());
}