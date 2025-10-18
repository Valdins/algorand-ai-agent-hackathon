#!/usr/bin/env python3
"""
Main entry point for the Algorand AI Agent Runner.
"""
import sys
import argparse
import json
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from core import config, log
from runner import runner


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Algorand AI Agent Runner")
    parser.add_argument("--prompt", required=True, help="Natural language prompt for smart contract")
    args = parser.parse_args()

    prompt = args.prompt.strip()
    if not prompt:
        log("ERROR: No prompt provided")
        return 2

    log(f"Received prompt: {prompt}")

    # Verify environment
    if not config.AZURE_OPENAI_API_KEY and not config.OPENAI_API_KEY:
        log("WARNING: No LLM API keys found.")
        log("Set AZURE_OPENAI_API_KEY or OPENAI_API_KEY environment variable")

    try:
        # Run the agent system
        result = runner.run(prompt)

        # Print final result for backend to capture
        print("RESULT: " + json.dumps(result), flush=True)
        log("Agent workflow completed successfully!")
        return 0

    except Exception as e:
        log(f"FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
