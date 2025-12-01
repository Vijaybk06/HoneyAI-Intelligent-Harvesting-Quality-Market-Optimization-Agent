from agents.data_agent import DataAgent
from agents.field_agent import FieldAgent
from agents.market_agent import MarketAgent
from memory.memory_bank import MemoryBank
from observability.logger import get_logger

logger = get_logger("orchestrator")


class Orchestrator:
    def __init__(self, memory_path: str = "memory.json") -> None:
        self.memory = MemoryBank(memory_path)
        self.data_agent = DataAgent(self.memory)
        self.field_agent = FieldAgent(self.memory)
        self.market_agent = MarketAgent(self.memory)

    def run(
        self,
        user_id: str,
        sample_features: dict,
        hive_status: dict,
        product_info: dict,
        session_id: str | None = None,
    ) -> dict:
        logger.info(
            "Orchestrator received request",
            extra={"user_id": user_id, "session_id": session_id},
        )

        purity = self.data_agent.predict(sample_features)
        harvest = self.field_agent.plan(hive_status, sample_features)
        market = self.market_agent.create_listing(product_info, purity)

        record = {
            "user_id": user_id,
            "session_id": session_id,
            "purity": purity,
            "harvest": harvest,
            "market": market,
        }
        self.memory.add_record(user_id, record)
        logger.info(
            "Orchestrator completed run",
            extra={"user_id": user_id, "session_id": session_id},
        )
        return record


if __name__ == "__main__":
    orch = Orchestrator()
    sample = {"moisture": 18.2, "hmf": 7}
    hive = {"strength": "medium", "queen_age_months": 12}
    prod = {"name": "Wildflower Honey", "origin": "Highlands"}
    result = orch.run("user_001", sample, hive, prod)
    print(result)






