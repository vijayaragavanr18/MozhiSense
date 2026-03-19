def build_graph_data(word_data: dict, variants_by_sense: dict) -> dict:
    nodes = []
    edges = []
    node_id = 1

    root_id = node_id
    nodes.append(
        {
            "id": root_id,
            "label": word_data["tamil"],
            "title": f"{word_data['roman']} · root word",
            "type": "root",
            "color": {"background": "#00D4B8", "border": "#00897B"},
            "font": {"color": "#0D1B2A", "size": 18, "face": "Baloo 2"},
            "size": 40,
            "shape": "circle",
        }
    )
    node_id += 1

    for sense in word_data["senses"]:
        sense_node_id = node_id
        color = "#9B7FE8" if sense["pos"] == "noun" else "#00D4B8"
        border_color = "#7C5CBF" if sense["pos"] == "noun" else "#00897B"

        nodes.append(
            {
                "id": sense_node_id,
                "label": word_data["tamil"],
                "title": f"{sense['label']}\n{sense['gloss']}",
                "type": "sense",
                "sense_id": sense["id"],
                "sense_label": sense["label"],
                "pos": sense["pos"],
                "color": {"background": color, "border": border_color},
                "font": {"color": "#0D1B2A", "size": 14, "face": "Baloo 2"},
                "size": 28,
                "shape": "circle",
            }
        )

        edges.append(
            {
                "from": root_id,
                "to": sense_node_id,
                "color": {"color": "rgba(255,255,255,0.2)"},
                "dashes": True,
                "width": 1.5,
            }
        )
        node_id += 1

        sense_variants = variants_by_sense.get(sense["id"], [])[:3]
        for variant in sense_variants:
            variant_id = node_id
            nodes.append(
                {
                    "id": variant_id,
                    "label": variant["form"],
                    "title": f"{variant['label']}: {variant['description']}",
                    "type": "morph",
                    "color": {"background": "#243650", "border": "#F4A12E"},
                    "font": {"color": "#F4A12E", "size": 12, "face": "Baloo 2"},
                    "size": 18,
                    "shape": "box",
                }
            )
            edges.append(
                {
                    "from": sense_node_id,
                    "to": variant_id,
                    "color": {"color": "rgba(244,161,46,0.3)"},
                    "width": 1,
                }
            )
            node_id += 1

    return {"nodes": nodes, "edges": edges}
