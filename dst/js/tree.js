"use strict";
var ooo;
(function (ooo) {
    var tree;
    (function (tree_1) {
        class CalculationCreatorManager {
            static create(calculation) {
                let creator = CalculationCreatorManager.creators[calculation.type];
                if (creator == undefined) {
                    throw {
                        message: `The calculation type not exists [${calculation.type}]`
                    };
                }
                return creator.create(calculation);
            }
            static addCreator(type, creator) {
                CalculationCreatorManager.creators[type] = creator;
            }
        }
        CalculationCreatorManager.creators = {};
        tree_1.CalculationCreatorManager = CalculationCreatorManager;
        class CalculationManager {
            constructor(trees) {
                this.trees = trees;
                this.calculations = [];
                this.changeImpact = {
                    "level": [],
                    "delete": [],
                    "insert": [],
                    "move": [],
                };
            }
            setCalculation(calculations) {
                for (let calc of calculations) {
                    this.calculations.push(CalculationCreatorManager.create(calc));
                }
            }
            clearCalculation() {
                this.calculations.length = 0;
            }
            propagateCalculationChangeValue(tree, index, column) {
                this.propagateCalculationBatch({
                    [tree]: {
                        changeValue: { [column]: [index] }
                    }
                });
            }
            propagateCalculationChangeLevel(tree, index) {
                this.propagateCalculationBatch({
                    [tree]: {
                        level: [index]
                    }
                });
            }
            propagateCalculationChangeDelete(tree, index) {
                this.propagateCalculationBatch({
                    [tree]: {
                        delete: [index]
                    }
                });
            }
            propagateCalculationChangeInsert(tree, index) {
                this.propagateCalculationBatch({
                    [tree]: {
                        insert: [index]
                    }
                });
            }
            propagateCalculationBatch(changes) {
                for (let calc of this.calculations) {
                    calc.calculate(this.trees, changes);
                }
            }
        }
        tree_1.CalculationManager = CalculationManager;
        class Calculation {
            constructor(calculationConfig) {
                this.calculationConfig = calculationConfig;
                this.depth = -1;
                this.init();
            }
            init() { }
            ;
        }
        tree_1.Calculation = Calculation;
        class CalculationCreator {
        }
        tree_1.CalculationCreator = CalculationCreator;
    })(tree = ooo.tree || (ooo.tree = {}));
})(ooo || (ooo = {}));
var ooo;
(function (ooo) {
    var tree;
    (function (tree) {
        class Calculation_lookup extends tree.Calculation {
            constructor(calculationConfig) {
                super(calculationConfig);
                this.calculationConfig = calculationConfig;
                let targetTreeName2;
                let referenceTreeName2;
                [this.targetTreeName, this.targetValue] = calculationConfig.arguments.target_column.split(".");
                [targetTreeName2, this.targetKey] = calculationConfig.arguments.lookup_key.split(".");
                [this.referenceTreeName, this.referenceValue] = calculationConfig.arguments.refernce_value.split(".");
                [referenceTreeName2, this.referenceKey] = calculationConfig.arguments.refernce_key.split(".");
                if (targetTreeName2 !== this.targetTreeName) {
                    console.warn(`[OOOTREE][Calculation(calculationConfig)][lookup] Calculation format is unexpected. Tree of target and lookup-key should be the same. (target_column=${calculationConfig.arguments.target_column}, lookup_key=${calculationConfig.arguments.lookup_key})`);
                }
                if (referenceTreeName2 !== this.referenceTreeName) {
                    console.warn(`[OOOTREE][Calculation(calculationConfig)][lookup] Calculation format is unexpected. Tree of target and lookup-key should be the same. (refernce_key=${calculationConfig.arguments.refernce_key}, refernce_value=${calculationConfig.arguments.refernce_value})`);
                }
            }
            calculate(trees, changes) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
                let self = this;
                // get tree. return if error.
                let _targetTree = trees.getTree(this.targetTreeName);
                if (!_targetTree) {
                    return;
                }
                let targetTree = _targetTree;
                let _referenceTree = trees.getTree(this.referenceTreeName);
                if (!_referenceTree) {
                    return;
                }
                let referenceTree = _referenceTree;
                // make reference table
                function getReferenceTable() {
                    let referenceTable = {};
                    for (let i = 0; i < referenceTree.data.length; i++) {
                        let key = referenceTree.getData(i, self.referenceKey);
                        let value = referenceTree.getData(i, self.referenceValue);
                        if (key !== undefined) {
                            referenceTable[key] = value;
                        }
                    }
                    return referenceTable;
                }
                ;
                // return if any of related columns are not updated.
                if (!((_b = (_a = changes[this.referenceTreeName]) === null || _a === void 0 ? void 0 : _a.changeValue) === null || _b === void 0 ? void 0 : _b[this.referenceKey]) &&
                    !((_d = (_c = changes[this.referenceTreeName]) === null || _c === void 0 ? void 0 : _c.changeValue) === null || _d === void 0 ? void 0 : _d[this.referenceValue]) &&
                    !((_e = changes[this.referenceTreeName]) === null || _e === void 0 ? void 0 : _e.insert) &&
                    !((_f = changes[this.referenceTreeName]) === null || _f === void 0 ? void 0 : _f.delete) &&
                    !((_h = (_g = changes[this.targetTreeName]) === null || _g === void 0 ? void 0 : _g.changeValue) === null || _h === void 0 ? void 0 : _h[this.targetKey]) &&
                    !((_k = (_j = changes[this.targetTreeName]) === null || _j === void 0 ? void 0 : _j.changeValue) === null || _k === void 0 ? void 0 : _k[this.targetValue]) &&
                    !((_l = changes[this.targetTreeName]) === null || _l === void 0 ? void 0 : _l.insert) &&
                    !((_m = changes[this.targetTreeName]) === null || _m === void 0 ? void 0 : _m.delete)) {
                    return;
                }
                let referenceKeyUpdated = ((_o = changes[this.referenceKey]) === null || _o === void 0 ? void 0 : _o.changeValue) || ((_p = changes[this.referenceKey]) === null || _p === void 0 ? void 0 : _p.insert) || ((_q = changes[this.referenceKey]) === null || _q === void 0 ? void 0 : _q.delete);
                let updatedReferenceValueIndexes = (_u = (_t = (_s = (_r = changes[this.referenceTreeName]) === null || _r === void 0 ? void 0 : _r.changeValue) === null || _s === void 0 ? void 0 : _s[this.referenceValue]) === null || _t === void 0 ? void 0 : _t.map(i => referenceTree.data[i].data[this.referenceKey])) !== null && _u !== void 0 ? _u : [];
                let updatedTargetKeyIndexes = (_x = (_w = (_v = changes[this.targetTreeName]) === null || _v === void 0 ? void 0 : _v.changeValue) === null || _w === void 0 ? void 0 : _w[this.targetKey]) !== null && _x !== void 0 ? _x : [];
                let updatedTargetValueIndexes = (_0 = (_z = (_y = changes[this.targetTreeName]) === null || _y === void 0 ? void 0 : _y.changeValue) === null || _z === void 0 ? void 0 : _z[this.targetValue]) !== null && _0 !== void 0 ? _0 : [];
                // update all data if any of reference keys are changed.
                let referenceTable = getReferenceTable();
                // update values.
                for (let i = 0; i < targetTree.data.length; i++) {
                    let key = targetTree.getData(i, self.targetKey);
                    let value = key === undefined ? undefined : referenceTable[key];
                    if (referenceKeyUpdated ||
                        key !== undefined ||
                        updatedReferenceValueIndexes.indexOf(key) != -1 ||
                        updatedTargetKeyIndexes.indexOf(i) != -1 ||
                        updatedTargetValueIndexes.indexOf(i) != -1) {
                        let originalValue = targetTree.data[i].data[this.targetValue];
                        let originalCalculatedValue = (_1 = targetTree.data[i].calculatedData) === null || _1 === void 0 ? void 0 : _1[this.targetValue];
                        if (originalValue || value == originalCalculatedValue) {
                            // It has the real value => skip
                            // The calculated value is not updated => skip
                            continue;
                        }
                        else {
                            // set value
                            targetTree.setCalculatedData(i, this.targetValue, value);
                            // add updated value
                            if (!changes[this.targetTreeName]) {
                                changes[this.targetTreeName] = {};
                            }
                            if (!changes[this.targetTreeName].changeValue) {
                                changes[this.targetTreeName].changeValue = {};
                            }
                            if (!changes[this.targetTreeName].changeValue[this.targetValue]) {
                                changes[this.targetTreeName].changeValue[this.targetValue] = [];
                            }
                            changes[this.targetTreeName].changeValue[this.targetValue].push(i);
                        }
                    }
                }
            }
        }
        tree.Calculation_lookup = Calculation_lookup;
        class CalculationCreator_lookup extends tree.CalculationCreator {
            create(calculationConfig) {
                return new Calculation_lookup(calculationConfig);
            }
        }
        tree.CalculationCreator_lookup = CalculationCreator_lookup;
        tree.CalculationCreatorManager.addCreator("lookup", new CalculationCreator_lookup());
    })(tree = ooo.tree || (ooo.tree = {}));
})(ooo || (ooo = {}));
var ooo;
(function (ooo) {
    var tree;
    (function (tree_2) {
        class Calculation_sameToParentRatio extends tree_2.Calculation {
            constructor(calculationConfig) {
                super(calculationConfig);
                this.calculationConfig = calculationConfig;
                this.baseColumnName = calculationConfig.arguments.base;
                [this.treeName, this.columnName] = calculationConfig.arguments.target_column.split(".");
                [this.baseTreeName, this.baseColumnName] = calculationConfig.arguments.base.split(".");
                if (this.treeName !== this.baseTreeName) {
                    console.warn(`[OOOTREE][Calculation(same_to_parent_ratio)][same_to_parent_ratio] Calculation format is unexpected. Tree of target and base should be the same. (target=${calculationConfig.arguments.target_column}, base=${calculationConfig.arguments.base})`);
                }
            }
            calculate(trees, changes) {
                var _a, _b, _c, _d;
                let parentIndexes = [];
                let self = this;
                // get tree. return if error.
                let _tree = trees.getTree(this.treeName);
                if (!_tree) {
                    return;
                }
                let tree = _tree;
                let _baseTree = trees.getTree(this.baseTreeName);
                if (!_baseTree) {
                    return;
                }
                let baseTree = _baseTree;
                let treeChange = changes[this.treeName];
                if (!treeChange) {
                    return;
                }
                // common function
                function updateData(index) {
                    let parentIndex = tree.getParent(index);
                    let calculatedValue;
                    if (parentIndex != -1) {
                        let parentValue = tree.getData(parentIndex, self.columnName);
                        let baseParentValue = baseTree.getData(parentIndex, self.baseColumnName);
                        let baseValue = baseTree.getData(index, self.baseColumnName);
                        if (parentValue &&
                            baseParentValue &&
                            baseParentValue != 0 &&
                            baseValue) {
                            calculatedValue = parentValue * baseValue / baseParentValue;
                        }
                        else {
                            calculatedValue = undefined;
                        }
                    }
                    else {
                        // Data of top level item is deleted
                        calculatedValue = undefined;
                    }
                    tree.setCalculatedData(index, self.columnName, calculatedValue);
                }
                // change value
                let changeIndex = [];
                if ((_a = treeChange.changeValue) === null || _a === void 0 ? void 0 : _a[this.columnName]) {
                    changeIndex.push(...treeChange.changeValue[this.columnName]);
                }
                if ((_b = treeChange.changeValue) === null || _b === void 0 ? void 0 : _b[this.baseColumnName]) {
                    changeIndex.push(...treeChange.changeValue[this.baseColumnName]);
                }
                const changeIndexSet = new Set(changeIndex);
                changeIndex = [...changeIndexSet];
                for (let index of changeIndex) {
                    if (tree.data[index].data[this.columnName] == undefined) {
                        updateData(index);
                    }
                    parentIndexes.push(index);
                }
                // change levels
                if (treeChange.level) {
                    for (let index of treeChange.level) {
                        updateData(index);
                        parentIndexes.push(index);
                    }
                }
                // insert row
                if (treeChange.insert) {
                    for (let index of treeChange.insert) {
                        updateData(index);
                        parentIndexes.push(index);
                    }
                }
                const parentIndexesSet = new Set(parentIndexes);
                parentIndexes = [...changeIndexSet];
                while (parentIndexes.length > 0) {
                    parentIndexes.sort((a, b) => a - b);
                    let parentIndex = parentIndexes.shift();
                    let childIndexes = tree.getChildren(parentIndex);
                    let parentValue = tree.getData(parentIndex, this.columnName);
                    let parentBaseValue = baseTree.getData(parentIndex, this.baseColumnName);
                    for (let childIndex of childIndexes) {
                        let originalValue = tree.data[childIndex].data[this.columnName];
                        let originalCalculatedValue = (_d = (_c = tree.data[childIndex].calculatedData) === null || _c === void 0 ? void 0 : _c[this.columnName]) !== null && _d !== void 0 ? _d : undefined;
                        let baseValue = baseTree.getData(childIndex, this.baseColumnName);
                        let newValue;
                        if (parentValue != undefined && parentBaseValue != undefined && baseValue != undefined) {
                            newValue = parentValue * baseValue / parentBaseValue;
                        }
                        else {
                            newValue = undefined;
                        }
                        if (originalValue == undefined && originalCalculatedValue != newValue) {
                            parentIndexes.push(childIndex);
                            tree.setCalculatedData(childIndex, this.columnName, newValue);
                            if (!treeChange.changeValue) {
                                treeChange.changeValue = { [this.columnName]: [childIndex] };
                            }
                            else if (!treeChange.changeValue[this.columnName]) {
                                treeChange.changeValue[this.columnName] = [];
                            }
                            else {
                                treeChange.changeValue[this.columnName].push(childIndex);
                            }
                        }
                    }
                }
            }
        }
        tree_2.Calculation_sameToParentRatio = Calculation_sameToParentRatio;
        class CalculationCreator_sameToParentRatio extends tree_2.CalculationCreator {
            create(calculationConfig) {
                return new Calculation_sameToParentRatio(calculationConfig);
            }
        }
        tree_2.CalculationCreator_sameToParentRatio = CalculationCreator_sameToParentRatio;
        tree_2.CalculationCreatorManager.addCreator("same_to_parent_ratio", new CalculationCreator_sameToParentRatio());
    })(tree = ooo.tree || (ooo.tree = {}));
})(ooo || (ooo = {}));
var ooo;
(function (ooo) {
    var tree;
    (function (tree_3) {
        class Calculation_sameToParent extends tree_3.Calculation {
            constructor(calculationConfig) {
                super(calculationConfig);
                this.calculationConfig = calculationConfig;
                [this.treeName, this.columnName] = calculationConfig.arguments.target_column.split(".");
            }
            calculate(trees, changes) {
                var _a, _b, _c;
                let parentIndexes = [];
                let self = this;
                // get tree. return if error.
                let _tree = trees.getTree(this.treeName);
                if (!_tree) {
                    return;
                }
                let tree = _tree;
                let treeChange = changes[this.treeName];
                if (!treeChange) {
                    return;
                }
                // common function
                // update specified value
                function updateData(index) {
                    let parentIndex = tree.getParent(index);
                    let calculatedValue;
                    if (parentIndex != -1) {
                        calculatedValue = tree.getData(parentIndex, self.columnName);
                    }
                    else {
                        // Data of top level item is deleted
                        calculatedValue = undefined;
                    }
                    tree.setCalculatedData(index, self.columnName, calculatedValue);
                }
                // change value
                if ((_a = treeChange.changeValue) === null || _a === void 0 ? void 0 : _a[this.columnName]) {
                    for (let index of treeChange.changeValue[this.columnName]) {
                        if (tree.data[index].data[this.columnName] == undefined) {
                            updateData(index);
                        }
                        parentIndexes.push(index);
                    }
                }
                // change levels
                if (treeChange.level) {
                    for (let index of treeChange.level) {
                        updateData(index);
                        parentIndexes.push(index);
                    }
                }
                // insert row
                if (treeChange.insert) {
                    for (let index of treeChange.insert) {
                        updateData(index);
                        parentIndexes.push(index);
                    }
                }
                while (parentIndexes.length > 0) {
                    parentIndexes.sort((a, b) => a - b);
                    let parentIndex = parentIndexes.shift();
                    let childIndexes = tree.getChildren(parentIndex);
                    let value = tree.getData(parentIndex, this.columnName);
                    for (let childIndex of childIndexes) {
                        let originalValue = tree.data[childIndex].data[this.columnName];
                        let originalCalculatedValue = (_c = (_b = tree.data[childIndex].calculatedData) === null || _b === void 0 ? void 0 : _b[this.columnName]) !== null && _c !== void 0 ? _c : undefined;
                        if (originalValue == undefined && originalCalculatedValue != value) {
                            parentIndexes.push(childIndex);
                            tree.setCalculatedData(childIndex, this.columnName, value);
                            if (!treeChange.changeValue) {
                                treeChange.changeValue = { [this.columnName]: [childIndex] };
                            }
                            else if (!treeChange.changeValue[this.columnName]) {
                                treeChange.changeValue[this.columnName] = [];
                            }
                            else {
                                treeChange.changeValue[this.columnName].push(childIndex);
                            }
                        }
                    }
                }
            }
        }
        tree_3.Calculation_sameToParent = Calculation_sameToParent;
        class CalculationCreator_sameToParent extends tree_3.CalculationCreator {
            create(calculationConfig) {
                return new Calculation_sameToParent(calculationConfig);
            }
        }
        tree_3.CalculationCreator_sameToParent = CalculationCreator_sameToParent;
        tree_3.CalculationCreatorManager.addCreator("same_to_parent", new CalculationCreator_sameToParent());
    })(tree = ooo.tree || (ooo.tree = {}));
})(ooo || (ooo = {}));
var ooo;
(function (ooo) {
    var tree;
    (function (tree_4) {
        class Calculation_sumAttributes extends tree_4.Calculation {
            constructor(calculationConfig) {
                super(calculationConfig);
                this.calculationConfig = calculationConfig;
                [this.treeName, this.columnName] = calculationConfig.arguments.target_column.split(".");
                this.attributes = calculationConfig.arguments.attributes;
            }
            calculate(trees, changes) {
                var _a, _b, _c;
                // get tree. return if error.
                let _tree = trees.getTree(this.treeName);
                if (!_tree) {
                    return;
                }
                let tree = _tree;
                let treeChange = changes[this.treeName];
                if (!treeChange) {
                    return;
                }
                let indexToUpdate = [];
                // change values
                for (let attribute of this.attributes) {
                    if ((_a = treeChange.changeValue) === null || _a === void 0 ? void 0 : _a[attribute]) {
                        indexToUpdate.push(...(_b = treeChange.changeValue) === null || _b === void 0 ? void 0 : _b[attribute]);
                    }
                }
                // insert row
                if (treeChange.insert) {
                    for (let index of treeChange.insert) {
                        indexToUpdate.push(index);
                    }
                }
                const indexToUpdateSet = new Set(indexToUpdate);
                indexToUpdate = [...indexToUpdateSet];
                for (let index of indexToUpdate) {
                    if (tree.data[index].data[this.columnName] == undefined) {
                        let sum = 0;
                        for (let attribute of this.attributes) {
                            let value = (_c = tree.getData(index, attribute)) !== null && _c !== void 0 ? _c : 0;
                            if (typeof (value) == "number") {
                                sum += value;
                            }
                        }
                        tree.setCalculatedData(index, this.columnName, sum);
                        if (!treeChange.changeValue) {
                            treeChange.changeValue = { [this.columnName]: [index] };
                        }
                        else if (!treeChange.changeValue[this.columnName]) {
                            treeChange.changeValue[this.columnName] = [];
                        }
                        else {
                            treeChange.changeValue[this.columnName].push(index);
                        }
                    }
                }
            }
        }
        tree_4.Calculation_sumAttributes = Calculation_sumAttributes;
        class CalculationCreator_sumAttributes extends tree_4.CalculationCreator {
            create(calculationConfig) {
                return new Calculation_sumAttributes(calculationConfig);
            }
        }
        tree_4.CalculationCreator_sumAttributes = CalculationCreator_sumAttributes;
        tree_4.CalculationCreatorManager.addCreator("sum_attribute", new CalculationCreator_sumAttributes());
    })(tree = ooo.tree || (ooo.tree = {}));
})(ooo || (ooo = {}));
var ooo;
(function (ooo) {
    var tree;
    (function (tree_5) {
        class Calculation_sumChildren extends tree_5.Calculation {
            constructor(calculationConfig) {
                super(calculationConfig);
                this.calculationConfig = calculationConfig;
                [this.treeName, this.columnName] = calculationConfig.arguments.target_column.split(".");
            }
            calculate(trees, changes) {
                var _a, _b, _c, _d;
                let indexesToUpdate = [];
                // get tree. return if error.
                let _tree = trees.getTree(this.treeName);
                if (!_tree) {
                    return;
                }
                let tree = _tree;
                let treeChange = changes[this.treeName];
                if (!treeChange) {
                    return;
                }
                // update values
                if ((_a = treeChange.changeValue) === null || _a === void 0 ? void 0 : _a[this.columnName]) {
                    for (let index of treeChange.changeValue[this.columnName]) {
                        indexesToUpdate.push(index);
                        let parentIndex = tree.getParent(index);
                        if (parentIndex >= 0) {
                            indexesToUpdate.push(parentIndex);
                        }
                    }
                }
                // change levels
                if (treeChange.level) {
                    for (let index of treeChange.level) {
                        indexesToUpdate.push(index);
                        let parentIndex = tree.getParent(index);
                        if (parentIndex >= 0) {
                            indexesToUpdate.push(parentIndex);
                        }
                        if (index > 0) {
                            let prevParentIndex = tree.getParent(index - 1);
                            if (prevParentIndex >= 0) {
                                indexesToUpdate.push(prevParentIndex);
                            }
                        }
                    }
                }
                // delete items
                if (treeChange.delete) {
                    for (let index of treeChange.delete) {
                        let parentIndex = tree.getParent(index - 1);
                        if (parentIndex >= 0) {
                            indexesToUpdate.push(parentIndex);
                        }
                    }
                }
                // insert items
                if (treeChange.insert) {
                    for (let index of treeChange.insert) {
                        let parentIndex = tree.getParent(index - 1);
                        if (parentIndex >= 0) {
                            indexesToUpdate.push(parentIndex);
                        }
                    }
                }
                while (indexesToUpdate.length > 0) {
                    indexesToUpdate.sort((a, b) => a - b);
                    let updateIndex = indexesToUpdate.pop();
                    let originalValue = tree.data[updateIndex].data[this.columnName];
                    let originalCalculatedValue = (_c = (_b = tree.data[updateIndex].calculatedData) === null || _b === void 0 ? void 0 : _b[this.columnName]) !== null && _c !== void 0 ? _c : undefined;
                    let result = tree
                        .getChildren(updateIndex)
                        .reduce((sum, v) => {
                        var _a, _b, _c;
                        return sum + ((_c = (_a = tree.data[v].data[this.columnName]) !== null && _a !== void 0 ? _a : (_b = tree.data[v].calculatedData) === null || _b === void 0 ? void 0 : _b[this.columnName]) !== null && _c !== void 0 ? _c : 0);
                    }, 0);
                    if (!tree.data[updateIndex].data[this.columnName] && ((_d = tree.data[updateIndex].calculatedData) === null || _d === void 0 ? void 0 : _d[this.columnName]) != result) {
                        tree.setCalculatedData(updateIndex, this.columnName, result);
                        if (originalValue == undefined && originalCalculatedValue != result) {
                            let parentIndex = tree.getParent(updateIndex);
                            if (parentIndex >= 0) {
                                indexesToUpdate.push(tree.getParent(updateIndex));
                            }
                            if (!treeChange.changeValue) {
                                treeChange.changeValue = { [this.columnName]: [updateIndex] };
                            }
                            else if (!treeChange.changeValue[this.columnName]) {
                                treeChange.changeValue[this.columnName] = [];
                            }
                            else {
                                treeChange.changeValue[this.columnName].push(updateIndex);
                            }
                        }
                    }
                }
            }
        }
        tree_5.Calculation_sumChildren = Calculation_sumChildren;
        class CalculationCreator_childSum extends tree_5.CalculationCreator {
            create(calculationConfig) {
                return new Calculation_sumChildren(calculationConfig);
            }
        }
        tree_5.CalculationCreator_childSum = CalculationCreator_childSum;
        tree_5.CalculationCreatorManager.addCreator("sum_children", new CalculationCreator_childSum());
    })(tree = ooo.tree || (ooo.tree = {}));
})(ooo || (ooo = {}));
var ooo;
(function (ooo) {
    var tree;
    (function (tree_6) {
        class CellDataManager {
        }
        tree_6.CellDataManager = CellDataManager;
        class CellDataManagerUtil {
            static onEditWithInput(tree, cell, events, type, option, ev) {
                let input = document.createElement("input");
                let canceled = false;
                let inputRemoved = false;
                tree.editing = true;
                input.value = (option === null || option === void 0 ? void 0 : option.keepValue) ? cell.innerText : "";
                input.type = type;
                cell.innerHTML = "";
                cell.append(input);
                input.focus();
                function editEnd() {
                    if (canceled) {
                        return;
                    }
                    if (inputRemoved) {
                        return;
                    }
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
                        case "Enter":
                            {
                                editEnd();
                            }
                            break;
                        case "Escape":
                            {
                                editCancel();
                            }
                            break;
                        default:
                            {
                                // console.log(ev.code);
                                // console.log(ev.key);
                            }
                            break;
                    }
                });
                input.addEventListener("blur", editEnd);
            }
        }
        tree_6.CellDataManagerUtil = CellDataManagerUtil;
        class CellDataManagerCreator {
        }
        tree_6.CellDataManagerCreator = CellDataManagerCreator;
        let creators = {};
        function addCellDataCreator(type, creator) {
            creators[type] = creator;
        }
        tree_6.addCellDataCreator = addCellDataCreator;
        function getCellDataCreator(type) {
            let creator = creators[type !== null && type !== void 0 ? type : "string"];
            if (creator) {
                return creator;
            }
            else {
                throw {
                    message: `Unknown cell data type [${type}]`
                };
            }
        }
        tree_6.getCellDataCreator = getCellDataCreator;
    })(tree = ooo.tree || (ooo.tree = {}));
})(ooo || (ooo = {}));
var ooo;
(function (ooo) {
    var tree;
    (function (tree_7) {
        class CellDataManager_number extends tree_7.CellDataManager {
            setValue(cell, newValue, calculatedValue) {
                var _a;
                if (newValue != undefined) {
                    cell.classList.remove("calculated");
                    cell.innerText = newValue.toString();
                }
                else {
                    cell.classList.add("calculated");
                    cell.innerText = (_a = calculatedValue === null || calculatedValue === void 0 ? void 0 : calculatedValue.toString()) !== null && _a !== void 0 ? _a : "";
                }
            }
            setCalculatedValue(cell, newCalculatedValue, value) {
                var _a;
                if (!value) {
                    cell.classList.add("calculated");
                    cell.innerText = (_a = newCalculatedValue === null || newCalculatedValue === void 0 ? void 0 : newCalculatedValue.toString()) !== null && _a !== void 0 ? _a : "";
                }
            }
            toJsonData(cell) {
                return Number(cell.innerText);
            }
            fromJsonData(cell, data) {
                cell.innerText = data ? data.toString() : "";
            }
            editCell(tree, cell, originalData, calculatedData, onEnd, option, ev) {
                tree_7.CellDataManagerUtil.onEditWithInput(tree, cell, {
                    onEnd: (data) => {
                        let value = data == "" ? undefined : Number(data);
                        this.setValue(cell, value, calculatedData);
                        onEnd(value);
                    },
                    onCancel: () => {
                        var _a;
                        cell.innerText = (_a = originalData === null || originalData === void 0 ? void 0 : originalData.toString()) !== null && _a !== void 0 ? _a : "";
                    }
                }, "number", option, ev);
            }
            getDefaultValue() {
                return undefined;
            }
        }
        class CellDataManagerCreator_number extends tree_7.CellDataManagerCreator {
            create() {
                return new CellDataManager_number();
            }
        }
        tree_7.addCellDataCreator("number", new CellDataManagerCreator_number());
    })(tree = ooo.tree || (ooo.tree = {}));
})(ooo || (ooo = {}));
var ooo;
(function (ooo) {
    var tree;
    (function (tree_8) {
        class CellDataManager_string extends tree_8.CellDataManager {
            setValue(cell, newValue, calculatedValue) {
                if (newValue != "") {
                    cell.classList.remove("calculated");
                    cell.innerText = newValue;
                }
                else {
                    cell.classList.add("calculated");
                    cell.innerText = calculatedValue !== null && calculatedValue !== void 0 ? calculatedValue : "";
                }
            }
            setCalculatedValue(cell, newCalculatedValue, currentValue) {
                if (!currentValue) {
                    cell.classList.add("calculated");
                    cell.innerText = newCalculatedValue !== null && newCalculatedValue !== void 0 ? newCalculatedValue : "";
                }
            }
            toJsonData(cell) {
                return cell.innerText;
            }
            fromJsonData(cell, data) {
                cell.innerText = data;
            }
            editCell(tree, cell, originalData, calculatedData, onEnd, option, ev) {
                tree_8.CellDataManagerUtil.onEditWithInput(tree, cell, {
                    onEnd: (data) => {
                        this.setValue(cell, data, calculatedData);
                        onEnd(data);
                    },
                    onCancel: () => {
                        cell.innerText = originalData;
                    }
                }, "text", option, ev);
            }
            getDefaultValue() {
                return "";
            }
        }
        class CellDataManagerCreator_string extends tree_8.CellDataManagerCreator {
            create() {
                return new CellDataManager_string();
            }
        }
        tree_8.addCellDataCreator("string", new CellDataManagerCreator_string());
    })(tree = ooo.tree || (ooo.tree = {}));
})(ooo || (ooo = {}));
var ooo;
(function (ooo) {
    var tree;
    (function (tree) {
        class TreeDataView {
            // #endregion
            // #region Init
            constructor(name, table, table_header, table_body, calculationManager) {
                this.name = name;
                this.table = table;
                this.table_header = table_header;
                this.table_body = table_body;
                this.calculationManager = calculationManager;
                this.columns = [];
                this.iconPath = "../icon/";
                this.data = [];
                this.cellDataManagers = {};
                // #region Event
                this.event = {};
                // #endregion
                // #region Edit Data
                this.editing = false;
                // #endregion
                // #region Selection
                this.isActive = false;
                this.selectionRange = new Rect(0, 0, 0, 0);
                this.currentCell = new Pos(0, 0);
                this.shiftSelectEnd = new Pos(0, 0);
                this.dragging = false;
                table.classList.add("ooo_tree");
                this.onInit_edit();
                this.onInit_selection();
            }
            addEvent(name, func) {
                if (!this.event[name]) {
                    this.event[name] = [func];
                }
                else {
                    this.event[name].push(func);
                }
            }
            fireEvent(name, arg) {
                if (this.event[name]) {
                    for (let func of this.event[name]) {
                        func(arg);
                    }
                }
            }
            setIconPath(path) {
                this.iconPath = path;
            }
            setColumns(columns) {
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
            setTableData(data) {
                var _a, _b;
                this.table_body.innerHTML = "";
                if (!data) {
                    data = [{
                            data: {},
                            level: 0
                        }];
                }
                this.data = data;
                for (let itemIndex = 0; itemIndex < data.length; itemIndex++) {
                    let item = data[itemIndex];
                    let tr = document.createElement("tr");
                    this.table_body.append(tr);
                    for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
                        let col = this.columns[colIndex];
                        if (colIndex == 0) {
                            this.addTreeCell(tr, col, (_a = item.data[col.name]) !== null && _a !== void 0 ? _a : "", this.data[itemIndex].level, this.hasChild(itemIndex) ?
                                this.data[itemIndex].open == true || this.data[itemIndex].open == undefined ?
                                    "open" : "closed" : "none");
                        }
                        else {
                            this.addCell(tr, col, (_b = item.data[col.name]) !== null && _b !== void 0 ? _b : "");
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
            getTableData() {
                return this.data;
            }
            // #endregion
            // #region Util
            hasChild(itemIndex) {
                return itemIndex < this.data.length - 1 && this.data[itemIndex].level < this.data[itemIndex + 1].level;
            }
            getWidth() {
                return this.columns.length;
            }
            getHeight() {
                return this.data.length;
            }
            getRow(index) {
                return this.table_body.rows[index];
            }
            getCell(row, col) {
                return this.table_body.rows[row].cells[col];
            }
            getEditArea(row, col) {
                if (col == 0) {
                    return this.table_body.rows[row].cells[col].getElementsByTagName("span")[0];
                }
                else {
                    return this.table_body.rows[row].cells[col];
                }
            }
            getTreeCell(index) {
                return this.table_body.rows[index].cells[0];
            }
            getTreeType(treeCell) {
                return treeCell.classList.contains("open") ? "open" :
                    treeCell.classList.contains("closed") ? "closed" : "none";
            }
            setTreeType(treeCell, type) {
                treeCell.classList.remove("open");
                treeCell.classList.remove("closed");
                treeCell.classList.remove("none");
                treeCell.classList.add(type);
                let img = treeCell.querySelector("img");
                img.src = this.iconPath + type + ".svg";
            }
            getLevel(index) {
                return this.data[index].level;
            }
            hideRow(index) {
                let treeRow = this.getRow(index);
                treeRow.style.visibility = "collapse";
            }
            showRow(index) {
                let treeRow = this.getRow(index);
                treeRow.style.visibility = "visible";
            }
            setVisible(start, end) {
                let closeLevel = -1;
                for (let i = start; i < end; i++) {
                    if (closeLevel == -1) {
                        if (this.data[i].open == false) {
                            closeLevel = this.data[i].level;
                        }
                        this.showRow(i);
                    }
                    else {
                        if (this.data[i].level > closeLevel) {
                            this.hideRow(i);
                        }
                        else if (this.data[i].level <= closeLevel) {
                            closeLevel = -1;
                            this.showRow(i);
                        }
                    }
                }
            }
            getChildRange(index) {
                let level = this.getLevel(index);
                for (let i = index + 1; i < this.data.length; i++) {
                    if (this.getLevel(i) <= level) {
                        return i;
                    }
                }
                return this.data.length;
            }
            contains(element) {
                let cur = element;
                while (cur) {
                    if (cur == this.table) {
                        return true;
                    }
                    cur = cur.parentElement;
                }
                return false;
            }
            addTreeCell(row, col, data, level, type) {
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
                img.addEventListener("click", () => { this.switch(row.rowIndex - 1); });
            }
            addCell(row, col, data) {
                let td = document.createElement("td");
                row.append(td);
                td.innerText = data;
                td.addEventListener("dblclick", (ev) => {
                    this.edit(td, col.name, true);
                });
            }
            getParent(index) {
                let level = this.getLevel(index) - 1;
                for (let i = index - 1; i >= 0; i--) {
                    if (this.getLevel(i) == level) {
                        return i;
                    }
                }
                return -1;
            }
            getParentPath(index) {
                let level = this.getLevel(index) - 1;
                let path = [];
                for (let i = index - 1; i >= 0; i--) {
                    if (this.getLevel(i) == level) {
                        path.unshift(i);
                        level--;
                    }
                }
                return path;
            }
            getChildren(index) {
                let level = this.getLevel(index);
                let children = [];
                for (let i = index + 1; i < this.data.length; i++) {
                    if (this.getLevel(i) == level) {
                        return children;
                    }
                    else if (this.getLevel(i) == level + 1) {
                        children.push(i);
                    }
                }
                return children;
            }
            getData(index, column) {
                var _a, _b;
                return (_a = this.data[index].data[column]) !== null && _a !== void 0 ? _a : (_b = this.data[index].calculatedData) === null || _b === void 0 ? void 0 : _b[column];
            }
            setCalculatedData(index, column, value) {
                if (!this.data[index].calculatedData) {
                    this.data[index].calculatedData = {};
                }
                this.data[index].calculatedData[column] = value;
                let columnIndex = this.columns.findIndex(v => v.name == column);
                let td = this.getEditArea(index, columnIndex);
                let cellDataManager = this.cellDataManagers[column];
                cellDataManager.setCalculatedValue(td, value, this.data[index].data[column]);
            }
            setData(index, column, value) {
                var _a;
                let columnIndex = this.columns.findIndex(v => v.name == column);
                let td = this.getEditArea(index, columnIndex);
                this.data[index].data[column] = value;
                let cellDataManager = this.cellDataManagers[column];
                cellDataManager.setValue(td, value, (_a = this.data[index].calculatedData) === null || _a === void 0 ? void 0 : _a[column]);
            }
            clearData(index, column) {
                var _a, _b;
                this.data[index].data[column] = undefined;
                if ((_a = this.data[index].calculatedData) === null || _a === void 0 ? void 0 : _a[column]) {
                    let columnIndex = this.columns.findIndex(v => v.name == column);
                    let td = this.table_body.rows[index].cells[columnIndex];
                    td.classList.add("calculated");
                    td.innerText = (_b = this.data[index].calculatedData) === null || _b === void 0 ? void 0 : _b[column];
                }
            }
            onInit_edit() {
                window.addEventListener("keydown", (ev) => {
                    var _a;
                    if (this.isActive && !this.editing) {
                        if (!ev.ctrlKey) {
                            switch (ev.key) {
                                case "F2":
                                    {
                                        this.edit(this.getEditArea(this.currentCell.row, this.currentCell.col), this.columns[this.currentCell.col].name, true);
                                    }
                                    break;
                                case "Delete":
                                    {
                                        let updateIndexes = {};
                                        for (let colIndex = this.selectionRange.left; colIndex < this.selectionRange.right; colIndex++) {
                                            let column = this.columns[colIndex].name;
                                            let cellDataManager = this.cellDataManagers[column];
                                            updateIndexes[column] = [];
                                            for (let index = this.selectionRange.top; index < this.selectionRange.bottom; index++) {
                                                let cell = this.getEditArea(index, colIndex);
                                                this.data[index].data[column] = cellDataManager.getDefaultValue();
                                                cellDataManager.setValue(cell, cellDataManager.getDefaultValue(), (_a = this.data[index].calculatedData) === null || _a === void 0 ? void 0 : _a[column]);
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
                                    }
                                    break;
                                default:
                                    {
                                        if (ev.key.length == 1) { // TODO: not proper code.
                                            this.edit(this.getEditArea(this.currentCell.row, this.currentCell.col), this.columns[this.currentCell.col].name, false, ev);
                                        }
                                    }
                                    break;
                            }
                        }
                        else {
                            switch (ev.key) {
                                case "i":
                                    {
                                        this.addRow(this.getRow(this.currentCell.row));
                                        this.onInsertRow_calculation(this.currentCell.row);
                                        ev.preventDefault();
                                        ev.stopPropagation();
                                    }
                                    break;
                                case "d":
                                    {
                                        let startIndex = this.currentCell.row;
                                        let endIndex = this.getChildRange(startIndex);
                                        for (let i = startIndex; i < endIndex; i++) {
                                            this.removeRow(this.getRow(startIndex));
                                        }
                                        this.onDeleteRow_calculation(startIndex);
                                        ev.preventDefault();
                                        ev.stopPropagation();
                                    }
                                    break;
                                case "ArrowRight":
                                    {
                                        this.setLevel(this.currentCell.row, this.getLevel(this.currentCell.row) + 1);
                                    }
                                    break;
                                case "ArrowLeft":
                                    {
                                        this.setLevel(this.currentCell.row, this.getLevel(this.currentCell.row) - 1);
                                    }
                                    break;
                            }
                            ev.stopPropagation();
                            ev.stopImmediatePropagation();
                            ev.preventDefault();
                            return false;
                        }
                    }
                }, { capture: true });
            }
            onAfterSetHeader_edit(columns) {
                this.cellDataManagers = {};
                for (let column of columns) {
                    this.cellDataManagers[column.name] = tree.getCellDataCreator(column.value_type).create();
                }
            }
            edit(cell, column, keepValue, ev) {
                var _a;
                let index = cell.closest("tr").rowIndex - 1;
                let cellDataManager = this.cellDataManagers[column];
                let originalData = this.data[index].data[column];
                let calculatedData = (_a = this.data[index].calculatedData) === null || _a === void 0 ? void 0 : _a[column];
                cellDataManager.editCell(this, cell, originalData, calculatedData, (data) => {
                    this.data[index].data[column] = data;
                    this.onAfterEdit_calculation(cell, originalData, data);
                }, {
                    keepValue: keepValue
                }, ev);
            }
            addRow(row) {
                var _a;
                let tr = this.table_body.insertRow(row.rowIndex);
                let level = this.data[row.rowIndex - 1].level;
                for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
                    let col = this.columns[colIndex];
                    let value = (_a = col.default_value) !== null && _a !== void 0 ? _a : "";
                    if (colIndex == 0) {
                        this.addTreeCell(tr, col, value, level, "none");
                    }
                    else {
                        this.addCell(tr, col, value);
                    }
                }
                this.data.splice(row.rowIndex, 0, {
                    data: {},
                    level: level
                });
            }
            removeRow(row) {
                let index = row.rowIndex - 1; // "-1" is header row.
                let tr = this.getRow(index);
                tr.remove();
                this.data.splice(index, 1);
            }
            setLevel(index, level) {
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
                }
                else {
                    // set "none" type
                    this.data[index - 1].open = undefined;
                    this.setTreeType(this.getTreeCell(index - 1), "none");
                }
                // change tree type of the item
                if (this.hasChild(index)) {
                    // set "open" type
                    this.data[index].open = true;
                    this.setTreeType(this.getTreeCell(index), "open");
                }
                else {
                    // set "none" type
                    this.data[index].open = undefined;
                    this.setTreeType(this.getTreeCell(index), "none");
                }
                // event
                this.onChangeLevel_calculation(index, currLevel, level);
            }
            switch(index) {
                let treeType = this.getTreeType(this.getTreeCell(index));
                if (treeType == "open") {
                    this.close(index);
                }
                else if (treeType == "closed") {
                    this.open(index);
                }
            }
            close(index) {
                this.setTreeType(this.getTreeCell(index), "closed");
                let level = this.data[index].level;
                this.data[index].open = false;
                for (let i = index + 1; i < this.data.length; i++) {
                    let iLevel = this.getLevel(i);
                    if (iLevel > level) {
                        this.hideRow(i);
                    }
                    else {
                        return;
                    }
                }
            }
            open(index) {
                this.setTreeType(this.getTreeCell(index), "open");
                this.data[index].open = true;
                this.setVisible(index, this.getChildRange(index));
            }
            getTableRange() {
                return new Rect(0, 0, this.getWidth(), this.getHeight());
            }
            onAfterSetHeader_selection(columns) {
                this.selectionRange.intersect(this.getTableRange());
            }
            onAfterSetTableData_selection(data) {
                this.selectionRange.intersect(this.getTableRange());
            }
            onInit_selection() {
                document.addEventListener("mousedown", (ev) => {
                    this.isActive = this.contains(ev.target);
                });
                document.addEventListener("keydown", (ev) => {
                    if (this.isActive) {
                        if (ev.shiftKey) {
                            switch (ev.code) {
                                case "ArrowUp":
                                    {
                                        this.shiftSelectEnd.row--;
                                    }
                                    break;
                                case "ArrowDown":
                                    {
                                        this.shiftSelectEnd.row++;
                                    }
                                    break;
                                case "ArrowLeft":
                                    {
                                        this.shiftSelectEnd.col--;
                                    }
                                    break;
                                case "ArrowRight":
                                    {
                                        this.shiftSelectEnd.col++;
                                    }
                                    break;
                                default:
                                    {
                                        // console.log(ev.code);
                                    }
                                    break;
                            }
                            this.shiftSelectEnd.moveInto(this.getTableRange());
                            let rect = Rect.getRect(this.currentCell, this.shiftSelectEnd);
                            this.selectionRange_change(rect.left, rect.top, rect.right, rect.bottom);
                        }
                        else {
                            switch (ev.code) {
                                case "ArrowUp":
                                    {
                                        this.currentCell_moveTo(this.currentCell.row - 1, this.currentCell.col);
                                    }
                                    break;
                                case "ArrowDown":
                                    {
                                        this.currentCell_moveTo(this.currentCell.row + 1, this.currentCell.col);
                                    }
                                    break;
                                case "ArrowLeft":
                                    {
                                        this.currentCell_moveTo(this.currentCell.row, this.currentCell.col - 1);
                                    }
                                    break;
                                case "ArrowRight":
                                    {
                                        this.currentCell_moveTo(this.currentCell.row, this.currentCell.col + 1);
                                    }
                                    break;
                                default:
                                    {
                                        // console.log(ev.code);
                                    }
                                    break;
                            }
                            this.shiftSelectEnd.moveTo(this.currentCell.row, this.currentCell.col);
                        }
                    }
                });
                window.addEventListener("mouseup", () => {
                    this.dragging = false;
                });
            }
            onMouseDown_selection(row, col) {
                this.currentCell_moveTo(row, col);
                this.shiftSelectEnd.moveTo(row, col);
                this.dragging = true;
            }
            onMouseOver_selection(row, col) {
                if (this.dragging) {
                    this.shiftSelectEnd = new Pos(row, col);
                    let rect = Rect.getRect(this.currentCell, this.shiftSelectEnd);
                    this.selectionRange_change(rect.left, rect.top, rect.right, rect.bottom);
                }
            }
            currentCell_moveTo(row, col) {
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
            selectionRange_change(left, top, right, bottom) {
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
                    this.currentCell.moveInto(this.selectionRange);
                }
            }
            // #endregion
            // #region Calculation
            onAfterEdit_calculation(cell, before, after) {
                let td = (cell.tagName == "TD" ? cell : cell.closest("td"));
                let columnIndex = td.cellIndex;
                let rowIndex = td.parentElement.rowIndex - 1;
                let column = this.columns[columnIndex].name;
                this.calculationManager.propagateCalculationChangeValue(this.name, rowIndex, column);
            }
            onChangeLevel_calculation(rowIndex, before, after) {
                this.calculationManager.propagateCalculationChangeLevel(this.name, rowIndex);
            }
            onInsertRow_calculation(rowIndex) {
                this.calculationManager.propagateCalculationChangeInsert(this.name, rowIndex);
            }
            onDeleteRow_calculation(rowIndex) {
                this.calculationManager.propagateCalculationChangeDelete(this.name, rowIndex);
            }
            onAfterSetTableData_calculation() {
                // calculate all items
                let values = {};
                for (let rowIndex = 0; rowIndex < this.data.length; rowIndex++) {
                    this.data[rowIndex].calculatedData = undefined;
                    for (let column of this.columns) {
                        if (this.data[rowIndex].data[column.name] !== undefined) {
                            if (values[column.name] === undefined) {
                                values[column.name] = [rowIndex];
                            }
                            else {
                                values[column.name].push(rowIndex);
                            }
                        }
                    }
                }
                this.calculationManager.propagateCalculationBatch({
                    changeValue: values
                });
            }
        }
        tree.TreeDataView = TreeDataView;
        class Rect {
            constructor(left, top, right, bottom) {
                this.left = left;
                this.top = top;
                this.right = right;
                this.bottom = bottom;
            }
            static getRect(p1, p2) {
                let left = Math.min(p1.col, p2.col);
                let right = Math.max(p1.col, p2.col);
                let top = Math.min(p1.row, p2.row);
                let bottom = Math.max(p1.row, p2.row);
                return new Rect(left, top, right + 1, bottom + 1);
            }
            moveTo(left, top, right = left + 1, bottom = top + 1) {
                this.left = left;
                this.top = top;
                this.right = right;
                this.bottom = bottom;
            }
            intersect(rect) {
                if (this.left < rect.left) {
                    this.left = rect.left;
                }
                if (this.top < rect.top) {
                    this.top = rect.top;
                }
                if (this.right >= rect.right) {
                    this.right = rect.right;
                }
                if (this.bottom >= rect.bottom) {
                    this.bottom = rect.bottom;
                }
            }
            *forEach() {
                for (let row = this.top; row < this.bottom; row++) {
                    for (let col = this.left; col < this.right; col++) {
                        yield { row: row, col: col };
                    }
                }
            }
        }
        class Pos {
            constructor(row, col) {
                this.row = row;
                this.col = col;
            }
            moveTo(row, col) {
                this.row = row;
                this.col = col;
            }
            moveInto(rect) {
                if (this.col < rect.left) {
                    this.col = rect.left;
                }
                if (this.col >= rect.right) {
                    this.col = rect.right - 1;
                }
                if (this.row < rect.top) {
                    this.row = rect.top;
                }
                if (this.row >= rect.bottom) {
                    this.row = rect.bottom - 1;
                }
            }
            isIn(rect) {
                return this.col >= rect.left
                    && this.col < rect.left
                    && this.row >= rect.top
                    && this.row < rect.bottom;
            }
        }
    })(tree = ooo.tree || (ooo.tree = {}));
})(ooo || (ooo = {}));
var ooo;
(function (ooo) {
    var tree;
    (function (tree_9) {
        class Trees {
            constructor(formatName) {
                this.formatName = formatName;
                this.trees = [];
                this.calculationManager = new tree_9.CalculationManager(this);
            }
            getTree(name) {
                var _a;
                let sheet = this.trees.find(v => v.name == name);
                return (_a = sheet === null || sheet === void 0 ? void 0 : sheet.tree) !== null && _a !== void 0 ? _a : undefined;
            }
            getData() {
                return {
                    trees: this.trees.map(v => {
                        return {
                            name: v.name,
                            data: v.tree.data
                        };
                    }),
                    format: this.formatName
                };
            }
            setData(data) {
                var _a;
                if (this.format) {
                    for (let formatTree of this.format.trees) {
                        let tree = this.trees.find(v => v.name == formatTree.name);
                        if (tree == undefined) {
                            continue;
                        }
                        tree.tree.setTableData((_a = data.trees.find(v => v.name == formatTree.name)) === null || _a === void 0 ? void 0 : _a.data);
                    }
                }
            }
            setFormat(format) {
                this.format = format;
                for (let treeConfig of format.trees) {
                    let tree = this.trees.find(v => v.name == treeConfig.name);
                    if (tree == undefined) {
                        continue;
                    }
                    tree.tree.setColumns(treeConfig.columns);
                }
                this.calculationManager.setCalculation(format.calculations);
            }
            addTrees(name, table, table_header, table_body) {
                this.trees.push({
                    name: name,
                    tree: new tree_9.TreeDataView(name, table, table_header, table_body, this.calculationManager)
                });
            }
            initData() {
                let changes = {};
                for (let tree of this.trees) {
                    changes[tree.name] = { changeValue: {} };
                    for (let column of tree.tree.columns) {
                        let indexes = [];
                        for (let i = 0; i < tree.tree.data.length; i++) {
                            indexes.push(i);
                        }
                        changes[tree.name].changeValue[column.name] = indexes;
                    }
                }
                this.calculationManager.propagateCalculationBatch(changes);
            }
        }
        tree_9.Trees = Trees;
    })(tree = ooo.tree || (ooo.tree = {}));
})(ooo || (ooo = {}));
//# sourceMappingURL=tree.js.map