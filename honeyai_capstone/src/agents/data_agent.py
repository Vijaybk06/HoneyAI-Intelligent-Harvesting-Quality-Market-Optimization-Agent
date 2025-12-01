from tools.purity_model import predict_purity
from observability.logger import get_logger

logger = get_logger("data_agent")


class DataAgent:
    def __init__(self, memory) -> None:
        self.memory = memory

    def predict(self, features: dict) -> dict:
        logger.info("DataAgent predict called", extra={"features": features})
        result = predict_purity(features)
        logger.info("DataAgent produced result", extra={"result": result})
        return result






