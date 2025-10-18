"""
Agent executor service for running agent containers.
"""
import os
import json
import subprocess
import threading
import time
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logging import get_logger
from app.models import TaskStatus
from app.services.task_manager import task_manager

logger = get_logger(__name__)


class AgentExecutor:
    """Service for executing agent containers."""

    def __init__(self):
        """Initialize agent executor."""
        self.image = settings.AGENT_IMAGE
        self.network = settings.DOCKER_NETWORK

    def execute_task(self, task_id: str, prompt: str) -> None:
        """
        Execute a task in a background thread.

        Args:
            task_id: Task identifier
            prompt: User's prompt
        """
        thread = threading.Thread(
            target=self._run_agent_container,
            args=(task_id, prompt),
            daemon=True
        )
        thread.start()
        logger.info(f"Started agent execution thread for task {task_id}")

    def _run_agent_container(self, task_id: str, prompt: str) -> None:
        """
        Run the agent container for a specific task.

        Args:
            task_id: Task identifier
            prompt: User's prompt
        """
        task_manager.update_task_status(task_id, TaskStatus.IN_PROGRESS)
        task_manager.add_task_log(task_id, f"Starting task {task_id}...")

        # Build docker command
        cmd = self._build_docker_command(prompt)

        # Try to run container, fall back to simulation if Docker unavailable
        try:
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )
        except FileNotFoundError:
            logger.warning("Docker not available, running simulation")
            self._run_simulation(task_id, prompt)
            return
        except Exception as e:
            error_msg = f"Failed to start agent container: {e}"
            logger.error(error_msg)
            task_manager.set_task_error(task_id, error_msg)
            return

        # Process container output
        self._process_container_output(task_id, proc)

    def _build_docker_command(self, prompt: str) -> list:
        """
        Build the Docker command for running the agent.

        Args:
            prompt: User's prompt

        Returns:
            List of command arguments
        """
        cmd = [
            "docker",
            "run",
            "--rm",
            "--network", self.network,
        ]

        # Forward environment variables
        env_keys = self._get_env_keys_to_forward()
        for key in env_keys:
            value = os.environ.get(key, "")
            if value:
                cmd.extend(["-e", f"{key}={value}"])

        # Add Algorand LocalNet connection info
        cmd.extend([
            "-e", f"ALGOD_SERVER={settings.ALGOD_SERVER}",
            "-e", f"ALGOD_TOKEN={settings.ALGOD_TOKEN}",
        ])

        # Add image and prompt
        cmd.extend([
            self.image,
            "--prompt",
            prompt,
        ])

        return cmd

    def _get_env_keys_to_forward(self) -> list:
        """
        Get list of environment variable keys to forward to agent container.

        Returns:
            List of environment variable keys
        """
        return [
            k for k in os.environ.keys()
            if k.startswith("AZURE_OPENAI_") or k in {
                "OPENAI_API_KEY",
                "OPENAI_API_BASE",
                "OPENAI_API_VERSION",
                "OPENAI_DEPLOYMENT",
                "LITELLM_LOG",
            }
        ]

    def _process_container_output(self, task_id: str, proc: subprocess.Popen) -> None:
        """
        Process output from the agent container.

        Args:
            task_id: Task identifier
            proc: Subprocess instance
        """
        final_result: Optional[Dict[str, Any]] = None

        try:
            assert proc.stdout is not None
            for line in proc.stdout:
                line = line.rstrip("\n")
                if not line:
                    continue

                # Check for RESULT line
                if line.startswith("RESULT:"):
                    payload = line[len("RESULT:"):].strip()
                    try:
                        final_result = json.loads(payload)
                    except json.JSONDecodeError:
                        # Keep as raw text if not valid JSON
                        final_result = {"raw": payload}
                else:
                    task_manager.add_task_log(task_id, line)

            # Wait for process to complete
            return_code = proc.wait()

            # Update task based on result
            if return_code == 0:
                if final_result is None:
                    final_result = {"message": "Agent finished without explicit result"}
                task_manager.set_task_result(task_id, final_result)
                task_manager.update_task_status(task_id, TaskStatus.COMPLETED)
                task_manager.add_task_log(task_id, "Agent finished successfully.")
                logger.info(f"Task {task_id} completed successfully")
            else:
                error_msg = f"Agent container exited with code {return_code}"
                task_manager.set_task_error(task_id, error_msg)
                logger.error(f"Task {task_id} failed: {error_msg}")

        except Exception as e:
            error_msg = f"Runtime error: {e}"
            task_manager.set_task_error(task_id, error_msg)
            logger.error(f"Task {task_id} error: {error_msg}")
            try:
                proc.kill()
            except Exception:
                pass

    def _run_simulation(self, task_id: str, prompt: str) -> None:
        """
        Run a simulation when Docker is not available.

        Args:
            task_id: Task identifier
            prompt: User's prompt
        """
        task_manager.add_task_log(task_id, "Docker not available. Running local simulation...")

        simulation_logs = [
            "Planner: breaking down steps...",
            "Research: consulting AlgoKit docs...",
            "Coding: creating AlgoKit project and writing contract...",
            "Testing: running unit tests...",
            "Deployment: deploying to LocalNet...",
        ]

        for msg in simulation_logs:
            task_manager.add_task_log(task_id, msg)
            time.sleep(0.8)

        result = {
            "app_id": "12345",
            "message": "Simulated deployment complete (Docker not available)",
            "note": "This is a simulation. Install Docker to run real deployments."
        }

        task_manager.set_task_result(task_id, result)
        task_manager.update_task_status(task_id, TaskStatus.COMPLETED)
        task_manager.add_task_log(task_id, "Simulation complete.")
        logger.info(f"Task {task_id} completed (simulation)")


# Global agent executor instance
agent_executor = AgentExecutor()
