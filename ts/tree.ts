namespace ooo.tree {
    export class TreeDataView {
        public columns: ColumnConfig[] = [];
        public iconPath: string = "../icon/";
        public data: TreeDataItem[] = [];
        public cellDataManagers: { [column: string]: ICellDataManager } = {};

        // #region Event
        public event: { [target: string]: Function[] } = {};
        public addEvent(name: string, func: Function) {
            if (!this.event[name]) {
                this.event[name] = [func];
            } else {
                this.event[name].push(func);
            }
        }
        public fireEvent(name: string, arg: any) {
            if (this.event[name]) {
                for (let func of this.event[name]) {
                    func(arg);
                }
            }
        }
        // #endregion

        // #region Init
        public constructor(
            public name: string,
            public table: HTMLTableElement,
            public table_header: HTMLTableSectionElement,
            public table_body: HTMLTableSectionElement,
            public calculationManager: CalculationManager
        ) {
            table.classList.add("ooo_tree");
            this.onInit_edit();
            this.onInit_selection();
        }

        public setIconPath(path: string) {
            this.iconPath = path;
        }

        public setColumns(columns: ColumnConfig[]) {
            this.columns = columns;
            this.table_header.innerHTML = "";
            let tr = document.createElement("tr");
            this.table_header.append(tr);
            for (let col of columns) {
                let td = document.createElement("th");
                tr.append(td);
                td.innerText = col.caption;
            }

            this.onAfterSetHeader_edit(columns);
            this.onAfterSetHeader_selection(columns);
        }

        public setTableData(data: TreeDataItem[]) {
            this.table_body.innerHTML = "";
            this.data = data;

            for (let itemIndex = 0; itemIndex < data.length; itemIndex++) {
                let item = data[itemIndex];
                let tr = document.createElement("tr");
                this.table_body.append(tr);
                for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
                    let col = this.columns[colIndex];
                    if (colIndex == 0) {
                        this.addTreeCell(
                            tr,
                            col,
                            item.data[col.name] ?? "",
                            this.data[itemIndex].level,
                            this.hasChild(itemIndex) ?
                                this.data[itemIndex].open == true || this.data[itemIndex].open == undefined ?
                                    "open" : "closed" : "none"
                        );
                    } else {
                        this.addCell(tr, col, item.data[col.name] ?? "");
                    }

                    let td = tr.cells[colIndex];

                    td.addEventListener("mousedown", (ev) => {
                        this.onMouseDown_selection(tr.rowIndex - 1, td.cellIndex);
                    });
                    td.addEventListener("mouseenter", (ev) => {
                        this.onMouseOver_selection(tr.rowIndex - 1, td.cellIndex);
                    });
                }
            }

            this.setVisible(0, data.length);
            this.onAfterSetTableData_selection(data);
            this.onAfterSetTableData_calculation();
        }

        public getTableData() {
            return this.data;
        }

        // #endregion

        // #region Util
        public hasChild(itemIndex: number): boolean {
            return itemIndex < this.data.length - 1 && this.data[itemIndex].level < this.data[itemIndex + 1].level;
        }

        public getWidth() {
            return this.columns.length;
        }

        public getHeight() {
            return this.data.length;
        }

        public getRow(index: number): HTMLTableRowElement {
            return this.table_body.rows[index];
        }

        public getCell(row: number, col: number) {
            return this.table_body.rows[row].cells[col];
        }

        public getEditArea(row: number, col: number) {
            if (col == 0) {
                return this.table_body.rows[row].cells[col].getElementsByTagName("span")[0];
            } else {
                return this.table_body.rows[row].cells[col];
            }
        }

        public getTreeCell(index: number): HTMLTableCellElement {
            return this.table_body.rows[index].cells[0];
        }

        public getTreeType(treeCell: HTMLTableCellElement): TreeCellType {
            return treeCell.classList.contains("open") ? "open" :
                treeCell.classList.contains("closed") ? "closed" : "none";
        }

        public setTreeType(treeCell: HTMLTableCellElement, type: TreeCellType) {
            treeCell.classList.remove("open");
            treeCell.classList.remove("closed");
            treeCell.classList.remove("none");
            treeCell.classList.add(type);

            let img = treeCell.querySelector("img") as HTMLImageElement;
            img.src = this.iconPath + type + ".svg";
        }

        public getLevel(index: number) {
            return this.data[index].level;
        }

        public hideRow(index: number) {
            let treeRow = this.getRow(index);
            treeRow.style.visibility = "collapse";
        }

        public showRow(index: number) {
            let treeRow = this.getRow(index);
            treeRow.style.visibility = "visible";
        }

        public setVisible(start: number, end: number) {
            let closeLevel = -1;
            for (let i = start; i < end; i++) {
                if (closeLevel == -1) {
                    if (this.data[i].open == false) {
                        closeLevel = this.data[i].level;
                    }
                    this.showRow(i);
                } else {
                    if (this.data[i].level > closeLevel) {
                        this.hideRow(i);
                    } else if (this.data[i].level <= closeLevel) {
                        closeLevel = -1;
                        this.showRow(i);
                    }
                }
            }
        }

        public getChildRange(index: number): number {
            let level = this.getLevel(index);
            for (let i = index + 1; i < this.data.length; i++) {
                if (this.getLevel(i) <= level) {
                    return i;
                }
            }
            return this.data.length;
        }

        public contains(element: Element | null): boolean {
            let cur = element;
            while (cur) {
                if (cur == this.table) {
                    return true;
                }
                cur = cur.parentElement;
            }
            return false;
        }

        public addTreeCell(row: HTMLTableRowElement, col: ColumnConfig, data: string, level: number, type: TreeCellType) {
            let td = document.createElement("td");
            row.append(td);

            td.style.setProperty("--level", level.toString());
            let img = document.createElement("img");
            let span = document.createElement("span");
            let div = document.createElement("div");
            td.append(div);
            div.append(img);
            div.append(span);
            this.setTreeType(td, type);

            span.innerText = data;
            td.addEventListener("dblclick", (ev) => { this.edit(span, col.name, true); });
            img.addEventListener("click", () => { this.switch(row.rowIndex - 1) });
        }

        public addCell(row: HTMLTableRowElement, col: ColumnConfig, data: string) {
            let td = document.createElement("td");
            row.append(td);

            td.innerText = data;
            td.addEventListener("dblclick", (ev) => {
                this.edit(td, col.name, true);
            });
        }

        public getParent(index: number): number {
            let level = this.getLevel(index) - 1;

            for (let i = index - 1; i >= 0; i--) {
                if (this.getLevel(i) == level) {
                    return i;
                }
            }

            return -1;
        }
        public getParentPath(index: number): number[] {
            let level = this.getLevel(index) - 1;
            let path: number[] = [];

            for (let i = index - 1; i >= 0; i--) {
                if (this.getLevel(i) == level) {
                    path.unshift(i);
                    level--;
                }
            }

            return path;
        }

        public getChildren(index: number): number[] {
            let level = this.getLevel(index);
            let children: number[] = [];

            for (let i = index + 1; i < this.data.length; i++) {
                if (this.getLevel(i) == level) {
                    return children;
                } else if (this.getLevel(i) == level + 1) {
                    children.push(i);
                }
            }
            return children;
        }

        public getData(index: number, column: string): any {
            return this.data[index].data[column] ?? this.data[index].calculatedData?.[column];
        }

        public setCalculatedData(index: number, column: string, value: any) {
            if (!this.data[index].calculatedData) {
                this.data[index].calculatedData = {};
            }
            this.data[index].calculatedData![column] = value;

            let columnIndex = this.columns.findIndex(v => v.name == column);
            let td = this.getEditArea(index, columnIndex);
            let cellDataManager = this.cellDataManagers[column];
            cellDataManager.setCalculatedValue(td, value, this.data[index].data[column]);
        }

        public setData(index: number, column: string, value: any) {
            let columnIndex = this.columns.findIndex(v => v.name == column);
            let td = this.getEditArea(index, columnIndex);
            this.data[index].data[column] = value;
            let cellDataManager = this.cellDataManagers[column];
            cellDataManager.setValue(td, value, this.data[index].calculatedData?.[column]);
        }

        public clearData(index: number, column: string) {
            this.data[index].data[column] = undefined;

            if (this.data[index].calculatedData?.[column]) {
                let columnIndex = this.columns.findIndex(v => v.name == column);
                let td = this.table_body.rows[index].cells[columnIndex];
                td.classList.add("calculated");
                td.innerText = this.data[index].calculatedData?.[column];
            }
        }
        // #endregion

        // #region Edit Data
        public editing = false;
        public onInit_edit() {
            window.addEventListener("keydown", (ev) => {
                if (this.isActive && !this.editing) {
                    if (!ev.ctrlKey) {
                        switch (ev.key) {
                            case "F2": {
                                this.edit(this.getEditArea(
                                    this.currentCell.row, this.currentCell.col),
                                    this.columns[this.currentCell.col].name,
                                    true);
                            } break;
                            case "Delete": {
                                let updateIndexes: { [column: string]: number[] } = {};
                                for (let colIndex = this.selectionRange.left; colIndex < this.selectionRange.right; colIndex++) {
                                    let column = this.columns[colIndex].name;
                                    let cellDataManager = this.cellDataManagers[column];
                                    updateIndexes[column] = [];

                                    for (let index = this.selectionRange.top; index < this.selectionRange.bottom; index++) {
                                        let cell = this.getEditArea(index, colIndex);
                                        this.data[index].data[column] = cellDataManager.getDefaultValue();
                                        cellDataManager.setValue(
                                            cell,
                                            cellDataManager.getDefaultValue(),
                                            this.data[index].calculatedData?.[column]);

                                        updateIndexes[column].push(index); // TODO: not necessary if the original value is empty.
                                    }
                                }

                                // recalculation
                                this.calculationManager.propagateCalculationBatch({
                                    [this.name]: {
                                        level: [],
                                        changeValue: updateIndexes,
                                    }
                                });
                            } break;
                            default: {
                                if (ev.key.length == 1) { // TODO: not proper code.
                                    this.edit(this.getEditArea(
                                        this.currentCell.row, this.currentCell.col),
                                        this.columns[this.currentCell.col].name,
                                        false,
                                        ev);
                                }
                            } break;
                        }
                    }
                    else {
                        switch (ev.key) {
                            case "i": {
                                this.addRow(this.getRow(this.currentCell.row));
                                this.onInsertRow_calculation(this.currentCell.row);
                                ev.preventDefault();
                                ev.stopPropagation();
                            } break;
                            case "d": {
                                let startIndex = this.currentCell.row;
                                let endIndex = this.getChildRange(startIndex);
                                for (let i = startIndex; i < endIndex; i++) {
                                    this.removeRow(this.getRow(startIndex));
                                }
                                this.onDeleteRow_calculation(startIndex);
                                ev.preventDefault();
                                ev.stopPropagation();
                            } break;
                            case "ArrowRight": {
                                this.setLevel(this.currentCell.row, this.getLevel(this.currentCell.row) + 1);
                            } break;
                            case "ArrowLeft": {
                                this.setLevel(this.currentCell.row, this.getLevel(this.currentCell.row) - 1);
                            } break;
                        }
                        ev.stopPropagation();
                        ev.stopImmediatePropagation();
                        ev.preventDefault();
                        return false;
                    }
                }
            }, { capture: true });
        }
        public onAfterSetHeader_edit(columns: ColumnConfig[]) {
            this.cellDataManagers = {};
            for (let column of columns) {
                this.cellDataManagers[column.name] = getCellDataCreator(column.value_type).create()
            }
        }

        public edit(cell: HTMLTableCellElement | HTMLSpanElement, column: string, keepValue: boolean, ev?: KeyboardEvent) {
            let index = (cell.closest("tr") as HTMLTableRowElement).rowIndex - 1;

            let cellDataManager = this.cellDataManagers[column];
            let originalData = this.data[index].data[column];
            let calculatedData = this.data[index].calculatedData?.[column];

            cellDataManager.editCell(
                this,
                cell,
                originalData,
                calculatedData,
                (data) => {
                    this.data[index].data[column] = data;
                    this.onAfterEdit_calculation(cell, originalData, data);
                },
                {
                    keepValue: keepValue
                },
                ev
            );
        }

        public addRow(row: HTMLTableRowElement) {
            let tr = this.table_body.insertRow(row.rowIndex);
            let level = this.data[row.rowIndex - 1].level;
            for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
                let col = this.columns[colIndex];
                let value = col.default_value ?? "";
                if (colIndex == 0) {
                    this.addTreeCell(tr, col, value, level, "none");
                } else {
                    this.addCell(tr, col, value);
                }
            }
            this.data.splice(row.rowIndex, 0, {
                data: {},
                level: level
            });
        }

        public removeRow(row: HTMLTableRowElement) {
            let index = row.rowIndex - 1; // "-1" is header row.
            let tr = this.getRow(index);
            tr.remove();
            this.data.splice(row.rowIndex, 1);
        }

        public setLevel(index: number, level: number) {
            // check if the item is not the first one or out of bound.
            if (index <= 0 || index >= this.data.length) {
                return;
            }

            let currLevel = this.data[index].level;
            let levelDiff = level - currLevel;
            let prevLevel = this.data[index - 1].level;

            // check if given level is valid.
            if (level < 0 || level > prevLevel + 1) {
                return;
            }

            // change level of the item and all children.
            let childEnd = this.getChildRange(index);
            for (let i = index; i < childEnd; i++) {
                this.data[i].level += levelDiff;
                this.getTreeCell(i).style.setProperty("--level", this.data[i].level.toString());
            }

            // change tree type of previous item
            if (level > prevLevel) {
                // set "open" type
                this.data[index - 1].open = true;
                this.setTreeType(this.getTreeCell(index - 1), "open");
            } else {
                // set "none" type
                this.data[index - 1].open = undefined;
                this.setTreeType(this.getTreeCell(index - 1), "none");
            }

            // change tree type of the item
            if (this.hasChild(index)) {
                // set "open" type
                this.data[index].open = true;
                this.setTreeType(this.getTreeCell(index), "open");
            } else {
                // set "none" type
                this.data[index].open = undefined;
                this.setTreeType(this.getTreeCell(index), "none");
            }

            // event
            this.onChangeLevel_calculation(index, currLevel, level);
        }

        public switch(index: number) {
            let treeType = this.getTreeType(this.getTreeCell(index));

            if (treeType == "open") {
                this.close(index);
            } else if (treeType == "closed") {
                this.open(index);
            }
        }

        public close(index: number) {
            this.setTreeType(this.getTreeCell(index), "closed");

            let level = this.data[index].level;
            this.data[index].open = false;

            for (let i = index + 1; i < this.data.length; i++) {
                let iLevel = this.getLevel(i);
                if (iLevel > level) {
                    this.hideRow(i);
                } else {
                    return;
                }
            }
        }

        public open(index: number) {
            this.setTreeType(this.getTreeCell(index), "open");
            this.data[index].open = true;
            this.setVisible(index, this.getChildRange(index));
        }
        // #endregion

        // #region Selection
        public isActive = false;
        public selectionRange: Rect = new Rect(0, 0, 0, 0);
        public currentCell: Pos = new Pos(0, 0);
        public shiftSelectEnd: Pos = new Pos(0, 0);
        private dragging = false;

        private getTableRange() {
            return new Rect(0, 0, this.getWidth(), this.getHeight());
        }

        private onAfterSetHeader_selection(columns: ColumnConfig[]) {
            this.selectionRange.intersect(this.getTableRange());
        }

        private onAfterSetTableData_selection(data: TreeDataItem[]) {
            this.selectionRange.intersect(this.getTableRange());
        }

        public onInit_selection() {
            document.addEventListener("mousedown", (ev) => {
                this.isActive = this.contains(ev.target as Element);
            });
            document.addEventListener("keydown", (ev) => {
                if (this.isActive) {
                    if (ev.shiftKey) {
                        switch (ev.code) {
                            case "ArrowUp": {
                                this.shiftSelectEnd.row--;
                            } break;
                            case "ArrowDown": {
                                this.shiftSelectEnd.row++;
                            } break;
                            case "ArrowLeft": {
                                this.shiftSelectEnd.col--;
                            } break;
                            case "ArrowRight": {
                                this.shiftSelectEnd.col++;
                            } break;
                            default: {
                                // console.log(ev.code);
                            } break;
                        }
                        this.shiftSelectEnd.moveInto(this.getTableRange());
                        let rect = Rect.getRect(this.currentCell, this.shiftSelectEnd);
                        this.selectionRange_change(rect.left, rect.top, rect.right, rect.bottom);
                    } else {
                        switch (ev.code) {
                            case "ArrowUp": {
                                this.currentCell_moveTo(this.currentCell.row - 1, this.currentCell.col);
                            } break;
                            case "ArrowDown": {
                                this.currentCell_moveTo(this.currentCell.row + 1, this.currentCell.col);
                            } break;
                            case "ArrowLeft": {
                                this.currentCell_moveTo(this.currentCell.row, this.currentCell.col - 1);
                            } break;
                            case "ArrowRight": {
                                this.currentCell_moveTo(this.currentCell.row, this.currentCell.col + 1);
                            } break;
                            default: {
                                // console.log(ev.code);
                            } break;
                        }
                        this.shiftSelectEnd.moveTo(this.currentCell.row, this.currentCell.col);
                    }
                }
            });
            window.addEventListener("mouseup", () => {
                this.dragging = false;
            });
        }

        private onMouseDown_selection(row: number, col: number) {
            this.currentCell_moveTo(row, col);
            this.shiftSelectEnd.moveTo(row, col);
            this.dragging = true;
        }

        private onMouseOver_selection(row: number, col: number) {
            if (this.dragging) {
                this.shiftSelectEnd = new Pos(row, col);
                let rect = Rect.getRect(this.currentCell, this.shiftSelectEnd);
                this.selectionRange_change(rect.left, rect.top, rect.right, rect.bottom);
            }
        }

        public currentCell_moveTo(row: number, col: number) {
            this.getCell(this.currentCell.row, this.currentCell.col).classList.remove("current");

            this.currentCell.row = row;
            this.currentCell.col = col;
            this.currentCell.moveInto(this.getTableRange());

            this.getCell(this.currentCell.row, this.currentCell.col).classList.add("current");

            // change selection range
            if (!this.currentCell.isIn(this.selectionRange)) {
                for (let { row, col } of this.selectionRange.forEach()) {
                    this.getCell(row, col).classList.remove("select");
                }
                this.selectionRange.moveTo(this.currentCell.col, this.currentCell.row);
                this.getCell(this.currentCell.row, this.currentCell.col).classList.add("select");
            }
        }

        public selectionRange_change(left: number, top: number, right: number, bottom: number) {
            for (let { row, col } of this.selectionRange.forEach()) {
                this.getCell(row, col).classList.remove("select");
            }

            this.selectionRange.moveTo(left, top, right, bottom);
            this.selectionRange.intersect(this.getTableRange());

            for (let { row, col } of this.selectionRange.forEach()) {
                this.getCell(row, col).classList.add("select");
            }

            // change current cell
            if (this.currentCell.isIn(this.selectionRange)) {
                this.currentCell.moveInto(this.selectionRange)
            }
        }

        // #endregion

        // #region Calculation
        public onAfterEdit_calculation(cell: HTMLTableCellElement | HTMLSpanElement, before: any, after: any) {
            let td: HTMLTableCellElement = (cell.tagName == "TD" ? cell : cell.closest("td")) as HTMLTableCellElement;
            let columnIndex = td.cellIndex;
            let rowIndex = (td.parentElement as HTMLTableRowElement).rowIndex - 1;
            let column = this.columns[columnIndex].name;

            this.calculationManager.propagateCalculationChangeValue(this.name, rowIndex, column);
        }

        public onChangeLevel_calculation(rowIndex: number, before: number, after: number) {
            this.calculationManager.propagateCalculationChangeLevel(this.name, rowIndex);
        }

        public onInsertRow_calculation(rowIndex: number) {
            this.calculationManager.propagateCalculationChangeInsert(this.name, rowIndex);
        }

        public onDeleteRow_calculation(rowIndex: number) {
            this.calculationManager.propagateCalculationChangeDelete(this.name, rowIndex);
        }

        public onAfterSetTableData_calculation() {
            // calculate all items
            let values: { [column: string]: number[] } = {};
            for (let rowIndex = 0; rowIndex < this.data.length; rowIndex++) {
                this.data[rowIndex].calculatedData = undefined;

                for (let column of this.columns) {
                    if (this.data[rowIndex].data[column.name] !== undefined) {
                        if (values[column.name] === undefined) {
                            values[column.name] = [rowIndex];
                        } else {
                            values[column.name].push(rowIndex);
                        }
                    }
                }
            }

            this.calculationManager.propagateCalculationBatch({
                changeValue: values
            });
        }
        // #endregion
    }

    class Rect {
        public constructor(
            public left: number,
            public top: number,
            public right: number,
            public bottom: number) { }

        public static getRect(p1: Pos, p2: Pos) {
            let left = Math.min(p1.col, p2.col);
            let right = Math.max(p1.col, p2.col);
            let top = Math.min(p1.row, p2.row);
            let bottom = Math.max(p1.row, p2.row);
            return new Rect(left, top, right + 1, bottom + 1);
        }

        public moveTo(left: number, top: number, right: number = left + 1, bottom: number = top + 1) {
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
        }

        public intersect(rect: Rect) {
            if (this.left < rect.left) { this.left = rect.left; }
            if (this.top < rect.top) { this.top = rect.top; }
            if (this.right >= rect.right) { this.right = rect.right; }
            if (this.bottom >= rect.bottom) { this.bottom = rect.bottom; }
        }

        public *forEach(): Generator<{ row: number, col: number }> {
            for (let row = this.top; row < this.bottom; row++) {
                for (let col = this.left; col < this.right; col++) {
                    yield { row: row, col: col };
                }
            }
        }
    }

    class Pos {
        public constructor(
            public row: number,
            public col: number) { }

        public moveTo(row: number, col: number) {
            this.row = row;
            this.col = col;
        }

        public moveInto(rect: Rect) {
            if (this.col < rect.left) { this.col = rect.left; }
            if (this.col >= rect.right) { this.col = rect.right - 1; }
            if (this.row < rect.top) { this.row = rect.top; }
            if (this.row >= rect.bottom) { this.row = rect.bottom - 1; }
        }

        public isIn(rect: Rect) {
            return this.col >= rect.left
                && this.col < rect.left
                && this.row >= rect.top
                && this.row < rect.bottom;
        }
    }
}