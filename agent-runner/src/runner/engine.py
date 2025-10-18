"""
Agent runner engine - wraps the main AlgorandAgentSystem.
"""
import sys
import importlib.util
from pathlib import Path


class AgentRunner:
    """Wrapper for the Algorand Agent System."""

    def run(self, prompt: str) -> dict:
        """
        Execute the agent workflow.

        Args:
            prompt: User's natural language prompt

        Returns:
            Result dictionary with app_id, message, etc.
        """
        # Import runner.py directly to avoid naming conflicts
        # In Docker: runner.py is at /app/runner.py
        runner_file = Path("/app/runner.py")

        # If running locally, adjust path
        if not runner_file.exists():
            runner_file = Path(__file__).parent.parent.parent / "runner.py"

        # Load the module directly from file
        spec = importlib.util.spec_from_file_location("algorand_runner", runner_file)
        if spec is None or spec.loader is None:
            raise ImportError(f"Could not load runner from {runner_file}")

        algorand_runner = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(algorand_runner)

        # Create and run the system
        system = algorand_runner.AlgorandAgentSystem(prompt)
        return system.run()
