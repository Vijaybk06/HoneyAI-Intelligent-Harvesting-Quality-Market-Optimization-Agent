import json
from pathlib import Path
from typing import Any, List


class MemoryBank:
    def __init__(self, path: str = "memory.json") -> None:
        self.path = Path(path)
        if not self.path.exists():
            self._write([])

    def _read(self) -> List[Any]:
        with open(self.path, "r", encoding="utf-8") as handle:
            return json.load(handle)

    def _write(self, data: List[Any]) -> None:
        with open(self.path, "w", encoding="utf-8") as handle:
            json.dump(data, handle, indent=2)

    def add_record(self, user_id: str, record: dict) -> None:
        data = self._read()
        data.append({"user_id": user_id, "record": record})
        self._write(data)

    def get_user_records(self, user_id: str) -> List[dict]:
        data = self._read()
        return [entry["record"] for entry in data if entry.get("user_id") == user_id]






