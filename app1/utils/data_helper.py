def update_from(source, new_item):
    for item in source:
        if new_item is None:
            item["state"]["disabled"] = "true"
        elif int(new_item["id"]) == item["id"]:
            item["text"] = new_item["text"]
            if "disabled" not in item["state"]:
                item["state"] = new_item["state"]
            if "disabled" in new_item["state"] and new_item["state"]["disabled"] and "children" in item:
                update_from(item["children"], None)
            return
        elif "is_new" in new_item and "parent_id" in new_item and item["id"] == int(new_item["parent_id"]):
            new_item.pop("is_new", None)
            if "children" not in item:
                item["children"] = [new_item]
            elif len([el for el in item["children"] if el["id"] == int(new_item["id"])]) == 0:
                item["children"].append(new_item)
            return

        if "children" not in item:
            continue

        update_from(item["children"], new_item)


def update(source, new_data):
    for new_item in new_data:
        if "is_new" in new_item and "parent_id" not in new_item \
                and len([el for el in source if el["id"] == int(new_item["id"])]) == 0:
            new_item.pop("is_new", None)
            source.append(new_item)
            update(source, new_item["children"])
        else:
            update_from(source, new_item)
            update(source, new_item["children"])
