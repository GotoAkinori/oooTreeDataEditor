namespace ooo.tree.viewer {
    async function init() {
        await load();
    }

    let tree: TreeDataView;

    async function load() {
        // TODO
        let treeData = {
            format: "sample",
            data: [
                { level: 0, data: { id: "1", name: "sample" } },
                { level: 1, data: { id: "2", name: "sample - 2" } },
                { level: 2, data: { id: "3", name: "sample - 3" } },
                { level: 2, data: { id: "4", name: "sample - 4" } },
                { level: 1, data: { id: "5", name: "sample - 5" } },
                { level: 0, data: { id: "6", name: "sample - 6" } },
                { level: 1, data: { id: "7", name: "sample - 7" } }
            ]
        };

        tree = new ooo.tree.TreeDataView(
            document.getElementById("tree_table") as HTMLTableElement,
            document.getElementById("tree_table_head") as HTMLTableSectionElement,
            document.getElementById("tree_table_body") as HTMLTableSectionElement
        );

        let config = await loadConfig(treeData.format);
        tree.setHeader(config.columns);
        tree.setTableData(treeData.data);
    }

    async function loadConfig(name: string) {
        let resp = await fetch(`../format/${name}.json`);
        return await resp.json();
    }

    window.addEventListener("load", init);
}
