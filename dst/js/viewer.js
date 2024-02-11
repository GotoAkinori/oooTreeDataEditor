"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var ooo;
(function (ooo) {
    var tree;
    (function (tree_1) {
        var viewer;
        (function (viewer) {
            let config;
            let format;
            let formatName;
            let query;
            let trees;
            function init() {
                return __awaiter(this, void 0, void 0, function* () {
                    query = getURLParam();
                    let resp = yield fetch(`../config/config.json`);
                    config = yield resp.json();
                    if (config.autoload) {
                        yield load();
                    }
                    events();
                });
            }
            function load() {
                return __awaiter(this, void 0, void 0, function* () {
                    let data = yield loadFile(config.io.load, {
                        urlparam: query
                    });
                    formatName = data.format;
                    format = yield loadConfig(formatName);
                    trees = new tree_1.Trees(formatName);
                    let mainDiv = document.getElementById("main");
                    for (let tree of format.trees) {
                        let table = document.createElement("table");
                        let thead = document.createElement("thead");
                        let tbody = document.createElement("tbody");
                        mainDiv.append(tree.name);
                        mainDiv.append(table);
                        table.append(thead);
                        table.append(tbody);
                        trees.addTrees(tree.name, table, thead, tbody);
                    }
                    trees.setFormat(format);
                    trees.setData(data);
                    trees.initData();
                });
            }
            function save() {
                return __awaiter(this, void 0, void 0, function* () {
                    let treeData = trees.getData();
                    yield saveFile(config.io.save, {
                        urlparam: query
                    }, JSON.stringify(treeData));
                });
            }
            function getURLParam() {
                let queryString = document.location.search.substring(1);
                let query = {};
                if (queryString) {
                    for (let [key, value] of queryString
                        .split("&")
                        .map((v) => v.split("="))) {
                        query[key] = decodeURIComponent(value);
                    }
                    return query;
                }
                else {
                    return {};
                }
            }
            function loadConfig(name) {
                return __awaiter(this, void 0, void 0, function* () {
                    let resp = yield fetch(`../format/${name}.json`);
                    return yield resp.json();
                });
            }
            function saveFile(config, param, data) {
                return __awaiter(this, void 0, void 0, function* () {
                    let res = yield fetch(formatString(config.url, param), {
                        method: config.method,
                        cache: "no-cache",
                        headers: {
                            "Content-Type": "application/octet-stream",
                        },
                        body: data,
                    });
                });
            }
            function loadFile(config, param) {
                return __awaiter(this, void 0, void 0, function* () {
                    let res = yield fetch(formatString(config.url, param), {
                        method: config.method,
                        cache: "no-cache",
                    });
                    return yield res.json();
                });
            }
            function formatString(str, param) {
                function getValue(object, symbolString) {
                    let result = object;
                    let symbolPath = symbolString.split(".");
                    for (let symbol of symbolPath) {
                        if (result == undefined) {
                            return undefined;
                        }
                        result = result[symbol];
                    }
                    return result;
                }
                let index1 = 0;
                let index2 = 0;
                while (true) {
                    index1 = str.indexOf("{", index2);
                    if (index1 == -1) {
                        break;
                    }
                    index2 = str.indexOf("}", index1);
                    if (index2 == -1) {
                        break;
                    }
                    let symbol = str.substring(index1 + 1, index2);
                    let replacedValue = getValue(param, symbol);
                    if (replacedValue === undefined) {
                        continue;
                    }
                    str = str.substring(0, index1) + replacedValue + str.substring(index2 + 1);
                    index2 = index1 + replacedValue.length;
                }
                return str;
            }
            function events() {
                document.getElementById("save").addEventListener("click", save);
            }
            window.addEventListener("load", init);
        })(viewer = tree_1.viewer || (tree_1.viewer = {}));
    })(tree = ooo.tree || (ooo.tree = {}));
})(ooo || (ooo = {}));
//# sourceMappingURL=viewer.js.map