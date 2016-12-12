(function (jQuery) {
    var cachedTree;
    var dbTree;
    var cachedSelectedNode;
    var cachedSelectedNodeHtml;
    var dbSelectedNode;
    var dbSelectedNodeHtml;
    var dbDataSource;
    var cachedDataSource;
    var movedNodes;
    var hasChanges;
    var increment;

    // init controls
    function init() {
        dbTree = $('#jstree_db').jstree()
            .on("dblclick.jstree",function () {
                moveNode();
            }).on("activate_node.jstree", function (e, data) {
                // get only one selected item from list
                dbSelectedNode = $(data.node)[0];
            });

        cachedTree = $("#jstree_cached").jstree(
            { "core": {"check_callback": true}
            }).on('create_node.jstree', function (e, data) {
            });

        cachedTree.on("activate_node.jstree", function (e, data) {
            cachedSelectedNodeHtml = $(data.event.target);

            // get only one selected item from list
            cachedSelectedNode = $(data.node)[0];
        });


        $(".add-node").click(function () {
            addNode();
        });

        $(".edit-node").click(function () {
            editNode();
        });

        $(".delete-node").click(function () {
            deleteNode();
        });

        $(".submit").click(function () {
            submit();
            reset();
            setIncrement(dbDataSource.data);
            refreshCachedTree();
        });

        $(".reset").click(function () {
            reset();
            $.get("reset", function (data, status) {
                refreshData();
            });
        });

        reset();
        refreshData();
    }

    // refresh cached tree with data source
    function refreshCachedTree() {
        cachedTree.jstree(true).settings.core = {"data": cachedDataSource};
        cachedTree.jstree(true).refresh();
    }

    // refresh DB tree with data source
    function refreshDBTree() {
        dbTree.jstree(true).settings.core = dbDataSource;
        dbTree.jstree(true).refresh();
    }

    // query data from server
    function refreshData() {
        $.get("get_values", function (data, status) {
            dbDataSource = data;

            refreshDBTree();
            refreshCachedTree();

            setIncrement(dbDataSource.data);
        });
    }

    // sort function for children
    function sortFnc(a, b) {
        return a.id > b.id
    }

    // insert node into tree
    function insertNode(parent, source, newNode) {
        if (parent == null || parent.parent == "#" && !newNode.hasOwnProperty("is_new")) {
            source.push(newNode);
            source.sort(sortFnc);
            return;
        }

        for (var i = 0; i < source.length; i++) {
            var el = source[i];
            if (el.id == parent.id) {
                el.children.push(newNode);
                el.children.sort(sortFnc);
            } else {
                insertNode(parent, el.children, newNode);
            }
        }
    }

    // add new node
    function addNode() {
        if (cachedSelectedNode != null && cachedSelectedNode.state["disabled"]) return;

        insertNode(cachedSelectedNode, cachedDataSource, createNode(null));
        hasChanges = true;

        refreshCachedTree();
    }

    // edit selected node
    function editNode() {
        if (cachedSelectedNodeHtml == null) return;

        if (!cachedSelectedNodeHtml.is("a") || cachedSelectedNodeHtml.hasClass("jstree-disabled")
            || cachedSelectedNodeHtml.hasClass("editable")) return;

        var editor = $("<input type='text' value='" + cachedSelectedNodeHtml.text() + "'>");
        cachedSelectedNodeHtml.addClass("editable");
        editor.insertAfter(cachedSelectedNodeHtml);
        editor.focusout(function () {
            var value = $.trim(editor.val());
            updateValue(cachedSelectedNode.id, cachedDataSource, value);
            cachedSelectedNodeHtml.removeClass("editable");
            cachedSelectedNodeHtml.html('<i class="jstree-icon jstree-themeicon" ' +
                'role="presentation"></i>' + value);
            editor.remove();
        }).keypress(function (event) {
            if (event.which != 13) {
                return;
            }
            editor.focusout();
        });
        editor.focus();
    }

    // delete selected node
    function deleteNode() {
        if (cachedSelectedNodeHtml == null) return;

        cachedSelectedNode.state["selected"] = false;
        cachedSelectedNode.state["disabled"] = true;
        markAsDeletedData(cachedSelectedNode.id, cachedDataSource, true);

        hasChanges = true;

        refreshCachedTree();
    }

    // mark node = searchId and node's children as deleted in source
    function markAsDeletedData(searchId, source, value) {
        for (var i = 0; i < source.length; i++) {
            if (searchId == null || source[i].id == searchId) {
                source[i].state["disabled"] = value;
                source[i]["removed"] = value;

                markAsDeletedData(null, source[i].children, value);

                if (searchId != null) return;
            }

            markAsDeletedData(searchId, source[i].children, value);
        }
    }

    // update value for node = searchId in source
    function updateValue(searchId, source, value) {
        for (var i = 0; i < source.length; i++) {
            if (source[i].id == searchId) {
                source[i].text = value;
                return;
            } else {
                updateValue(searchId, source[i].children, value);
            }
        }
    }

    // rebuild relationships in datasource for cachedTree.
    function rebuild() {
        cachedDataSource.sort();

        for (var j = 0; j < 2; j++) {
            for (var i = 0; i < cachedDataSource.length; i++) {
                if (cachedDataSource[i].hasOwnProperty("parent_id")) {
                    var tmp = JSON.stringify(cachedDataSource);
                    insertNode({"id": cachedDataSource[i].parent_id}, cachedDataSource, cachedDataSource[i]);
                    if (JSON.stringify(cachedDataSource) === tmp) continue;

                    cachedDataSource.splice(i, 1);
                }
            }
        }
    }

    // move node from DBTree to cachedTree
    function moveNode() {
        if (hasChanges) {
            alert("You have unsaved data. Please apply changes and try again.");
            return;
        }

        // check on double entry
        if (dbSelectedNode == null || movedNodes.indexOf(dbSelectedNode.id) != -1) return;

        movedNodes.push(dbSelectedNode.id);
        var newNode = createNode(dbSelectedNode);
        var tmp = JSON.stringify(cachedDataSource);
        insertNode({"id": dbSelectedNode.parent}, cachedDataSource, newNode);
        if (JSON.stringify(cachedDataSource) === tmp)
            cachedDataSource.push(newNode);

        rebuild();

        refreshCachedTree();
    }

    // reset data
    function reset() {
        cachedSelectedNode = cachedSelectedNodeHtml = null;
        dbSelectedNode = dbSelectedNodeHtml = null;
        cachedDataSource = [];
        movedNodes = [];
        increment = 0;
        hasChanges = false;
    }

    // apply local changes
    function submit() {
        $.ajax({
            headers: { "X-CSRFToken": $.cookie("csrftoken") },
            url: 'submit',
            data: JSON.stringify({"data": cachedDataSource}),
            type: 'POST',
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                dbDataSource = {"data": response};
                refreshDBTree();
            },
            error: function (event) {
                console.log(event);
            }
        });
    }

    // create node item
    function createNode(treeNode) {
        var item = {"state": {"opened": true}, "children": []};
        if (treeNode == null) {
            increment++;
            item["id"] = increment;
            item["text"] = "Node" + increment;
            item["is_new"] = true;
            if (cachedSelectedNode != null)
                item["parent_id"] = cachedSelectedNode.id;
        }
        else {
            item["id"] = treeNode.id
            item["text"] = treeNode.text;
            item["parent_id"] = treeNode.parent;
        }

        return item;
    }

    // search max index in data. Use it on insert for new nodes
    function setIncrement(data) {
        if (!data) return;

        for (var i = 0; i < data.length; i++) {
            increment = Math.max(increment, data[i].id);
            setIncrement(data[i].children);
        }
    }

    $(document).ready(init);
})
    (jQuery);