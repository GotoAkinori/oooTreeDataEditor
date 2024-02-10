namespace ooo.tree.viewer {
    let config: any;
    let format: any;
    let formatName: string;
    let query: { [key: string]: string };
    let trees: Trees;

    async function init() {
        query = getURLParam();

        let resp = await fetch(`../config/config.json`);
        config = await resp.json();

        if (config.autoload) {
            await load();
        }

        events();
    }

    async function load() {
        let data = await loadFile(config.io.load, {
            urlparam: query
        });

        formatName = data.format;
        format = await loadConfig(formatName);
        trees = new Trees(formatName);

        let mainDiv = document.getElementById("main") as HTMLDivElement;

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
    }

    async function save() {
        let treeData = trees.getData();
        await saveFile(config.io.save, {
            urlparam: query
        }, JSON.stringify(treeData));
    }

    function getURLParam(): { [key: string]: string } {
        let queryString = document.location.search.substring(1);
        let query: { [key: string]: string } = {};

        if (queryString) {
            for (let [key, value] of queryString
                .split("&")
                .map((v) => v.split("="))) {
                query[key] = decodeURIComponent(value);
            }
            return query;
        } else {
            return {};
        }
    }

    async function loadConfig(name: string) {
        let resp = await fetch(`../format/${name}.json`);
        return await resp.json();
    }

    async function saveFile(config: any, param: any, data: string) {
        let res = await fetch(formatString(
            config.url,
            param
        ), {
            method: config.method,
            cache: "no-cache",
            headers: {
                "Content-Type": "application/octet-stream",
            },
            body: data,
        });
    }

    async function loadFile(config: any, param: any): Promise<any> {
        let res = await fetch(formatString(
            config.url,
            param
        ), {
            method: config.method,
            cache: "no-cache",
        });
        return await res.json();
    }

    function formatString(str: string, param: any): any {
        function getValue(object: any, symbolString: string): any {
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
            if (index1 == -1) { break; }
            index2 = str.indexOf("}", index1);
            if (index2 == -1) { break; }

            let symbol = str.substring(index1 + 1, index2);
            let replacedValue = getValue(param, symbol) as (string | undefined);
            if (replacedValue === undefined) {
                continue;
            }

            str = str.substring(0, index1) + replacedValue + str.substring(index2 + 1);
            index2 = index1 + replacedValue.length;
        }

        return str;
    }

    function events() {
        (document.getElementById("save") as HTMLButtonElement).addEventListener("click", save);
    }

    window.addEventListener("load", init);
}