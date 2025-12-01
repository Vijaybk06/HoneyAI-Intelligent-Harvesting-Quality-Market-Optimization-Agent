# HoneyAI — Smart Honey Harvesting & Market Intelligence Agent

## Overview

HoneyAI is a multi-agent system that helps honey producers predict honey quality, optimize harvest timing, and generate market-ready product listings. The project demonstrates agent concepts including parallel agents, tools (code-exec), session & memory, and observability.

## Features

- Purity prediction (rule-based + optional lightweight ML)
- Harvest planning (seasonal & weather-aware checklists)
- Market listing generator (product title, description, bullets, price suggestion)
- Orchestrator that coordinates agents
- Memory Bank (JSON/SQLite) for long-term history
- Simple logging & metrics for observability

## Repo structure

```
honeyai-capstone/
├─ README.md
├─ requirements.txt
├─ notebooks/
│  └─ demo.ipynb
├─ src/
│  ├─ agents/
│  │  ├─ orchestrator.py
│  │  ├─ data_agent.py
│  │  ├─ field_agent.py
│  │  └─ market_agent.py
│  ├─ tools/
│  │  ├─ purity_model.py
│  │  ├─ weather_tool.py
│  │  └─ llm_shim.py
│  ├─ memory/
│  │  └─ memory_bank.py
│  └─ observability/
│     └─ logger.py
├─ docs/
│  ├─ architecture.svg
│  └─ architecture.txt
└─ data/
   └─ sample_tests.json
```

## Quickstart — Local Demo

1. **Clone**
   ```bash
   git clone https://github.com/yourname/honeyai-capstone.git
   cd honeyai-capstone
   ```
2. **Create venv & install**
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
3. **Run the demo notebook (Kaggle recommended)**
   Open `notebooks/demo.ipynb` locally or on Kaggle and execute the cells.

## How it works

1. The Orchestrator receives user input (sample features + hive status + product info).
2. Data Agent returns purity score and remediation tips.
3. Field Agent returns harvest plan and checklist.
4. Market Agent generates a market-ready product card using the Data Agent outputs.
5. Memory Bank saves session data for personalization.

## Notes

- No API keys are included. Replace `llm_shim.py` with your LLM integration when deployed.
- The purity model is rule-based for reproducibility. You can train a scikit-learn model and plug it into `tools/purity_model.py`.

## License

MIT

## Contact

Your Name — your.email@example.com






