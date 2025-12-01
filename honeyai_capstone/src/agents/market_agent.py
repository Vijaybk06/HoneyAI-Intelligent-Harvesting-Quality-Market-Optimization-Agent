from tools.llm_shim import generate_text
from observability.logger import get_logger

logger = get_logger("market_agent")

PROMPT_TMPL = """
You are an assistant that writes product listings for honey.

Input:
- name: {name}
- origin: {origin}
- purity_label: {purity_label}
- purity_percent: {purity_percent}
- notes: {notes}

Output JSON with keys: title, description, bullets (list), price_suggestion
"""


class MarketAgent:
    def __init__(self, memory) -> None:
        self.memory = memory

    def create_listing(self, product_info: dict, purity_result: dict) -> dict:
        logger.info(
            "MarketAgent called",
            extra={"product_info": product_info, "purity": purity_result},
        )
        prompt = PROMPT_TMPL.format(
            name=product_info.get("name", "Honey"),
            origin=product_info.get("origin", "Local"),
            purity_label=purity_result.get("label", "Unknown"),
            purity_percent=purity_result.get("purity_percent", 0),
            notes=product_info.get("notes", ""),
        )
        _ = generate_text(prompt)

        listing = {
            "title": f"{product_info.get('name', 'Honey')} — {purity_result.get('label', 'Quality')}",
            "description": (
                f"Small-batch {product_info.get('origin', 'local')} honey with "
                f"{purity_result.get('purity_percent', 0)}% measured purity."
            ),
            "bullets": [
                "Small-batch",
                "Tested for quality",
                "Sustainably harvested",
            ],
            "price_suggestion": "₹200 - ₹350 per 500g",
        }
        logger.info("MarketAgent listing created", extra={"listing": listing})
        return listing






