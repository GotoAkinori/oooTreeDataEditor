namespace ooo.tree {
    export class Calculation_lookup extends Calculation {
        private targetTreeName: string;
        private targetKey: string;
        private targetValue: string;
        private referenceTreeName: string;
        private referenceKey: string;
        private referenceValue: string;

        public constructor(public calculationConfig: CalculationConfig) {
            super(calculationConfig);
            let targetTreeName2: string;
            let referenceTreeName2: string;
            [this.targetTreeName, this.targetValue] = calculationConfig.arguments.target_column.split(".");
            [targetTreeName2, this.targetKey] = calculationConfig.arguments.lookup_key.split(".");
            [this.referenceTreeName, this.referenceValue] = calculationConfig.arguments.refernce_value.split(".");
            [referenceTreeName2, this.referenceKey] = calculationConfig.arguments.refernce_key.split(".");

            if (targetTreeName2 !== this.targetTreeName) {
                console.warn(`[OOOTREE][Calculation(calculationConfig)][lookup] Calculation format is unexpected. Tree of target and lookup-key should be the same. (target_column=${calculationConfig.arguments.target_column}, lookup_key=${calculationConfig.arguments.lookup_key})`)
            }

            if (referenceTreeName2 !== this.referenceTreeName) {
                console.warn(`[OOOTREE][Calculation(calculationConfig)][lookup] Calculation format is unexpected. Tree of target and lookup-key should be the same. (refernce_key=${calculationConfig.arguments.refernce_key}, refernce_value=${calculationConfig.arguments.refernce_value})`)
            }
        }

        public calculate(trees: Trees, changes: TreeDataChanges): void {
            let self = this;

            // get tree. return if error.
            let _targetTree = trees.getTree(this.targetTreeName);
            if (!_targetTree) { return; }
            let targetTree = _targetTree;

            let _referenceTree = trees.getTree(this.referenceTreeName);
            if (!_referenceTree) { return; }
            let referenceTree = _referenceTree;

            // make reference table
            function getReferenceTable(): { [key: string | number]: any } {
                let referenceTable: { [key: string | number]: any } = {};

                for (let i = 0; i < referenceTree.data.length; i++) {
                    let key = referenceTree.getData(i, self.referenceKey);
                    let value = referenceTree.getData(i, self.referenceValue);

                    if (key !== undefined) {
                        referenceTable[key] = value;
                    }
                }

                return referenceTable;
            };

            // return if any of related columns are not updated.
            if (
                !changes[this.referenceTreeName]?.changeValue?.[this.referenceKey] &&
                !changes[this.referenceTreeName]?.changeValue?.[this.referenceValue] &&
                !changes[this.referenceTreeName]?.insert &&
                !changes[this.referenceTreeName]?.delete &&
                !changes[this.targetTreeName]?.changeValue?.[this.targetKey] &&
                !changes[this.targetTreeName]?.changeValue?.[this.targetValue] &&
                !changes[this.targetTreeName]?.insert &&
                !changes[this.targetTreeName]?.delete
            ) { return; }

            let referenceKeyUpdated = changes[this.referenceKey]?.changeValue || changes[this.referenceKey]?.insert || changes[this.referenceKey]?.delete;
            let updatedReferenceValueIndexes = changes[this.referenceTreeName]?.changeValue?.[this.referenceValue]?.map(i => referenceTree.data[i].data[this.referenceKey]) ?? [];
            let updatedTargetKeyIndexes = changes[this.targetTreeName]?.changeValue?.[this.targetKey] ?? [];
            let updatedTargetValueIndexes = changes[this.targetTreeName]?.changeValue?.[this.targetValue] ?? [];

            // update all data if any of reference keys are changed.
            let referenceTable = getReferenceTable();

            // update values.
            for (let i = 0; i < targetTree.data.length; i++) {
                let key = targetTree.getData(i, self.targetKey);
                let value = key === undefined ? undefined : referenceTable[key];

                if (
                    referenceKeyUpdated ||
                    key !== undefined ||
                    updatedReferenceValueIndexes.indexOf(key) != -1 ||
                    updatedTargetKeyIndexes.indexOf(i) != -1 ||
                    updatedTargetValueIndexes.indexOf(i) != -1
                ) {
                    let originalValue = targetTree.data[i].data[this.targetValue];
                    let originalCalculatedValue = targetTree.data[i].calculatedData?.[this.targetValue];

                    if (originalValue || value == originalCalculatedValue) {
                        // It has the real value => skip
                        // The calculated value is not updated => skip
                        continue;
                    } else {
                        // set value
                        targetTree.setCalculatedData(i, this.targetValue, value);

                        // add updated value
                        if (!changes[this.targetTreeName]) {
                            changes[this.targetTreeName] = {};
                        }
                        if (!changes[this.targetTreeName].changeValue) {
                            changes[this.targetTreeName].changeValue = {};
                        }
                        if (!changes[this.targetTreeName].changeValue![this.targetValue]) {
                            changes[this.targetTreeName].changeValue![this.targetValue] = [];
                        }
                        changes[this.targetTreeName].changeValue![this.targetValue].push(i);
                    }
                }
            }
        }
    }

    export class CalculationCreator_lookup extends CalculationCreator<Calculation_lookup> {
        public create(calculationConfig: CalculationConfig): Calculation_lookup {
            return new Calculation_lookup(calculationConfig);
        }
    }
    CalculationCreatorManager.addCreator("lookup", new CalculationCreator_lookup());
}