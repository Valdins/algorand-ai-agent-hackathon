"""
Documentation search tool for RAG.
"""
from pathlib import Path
from smolagents import tool
from src.core import config, log


@tool
def search_documentation(query: str) -> str:
    """
    Search the AlgoKit documentation for information.

    Args:
        query: The search query

    Returns:
        Relevant documentation content
    """
    log(f"Tool: Searching documentation for: {query}")
    try:
        doc_path = config.DOCS_DIR / "algokit_guide.md"
        with open(doc_path, 'r') as f:
            docs = f.read()

        # Simple keyword search - return relevant sections
        lines = docs.split('\n')
        relevant_lines = []
        query_lower = query.lower()

        for i, line in enumerate(lines):
            if query_lower in line.lower():
                # Include context (5 lines before and after)
                start = max(0, i - 5)
                end = min(len(lines), i + 6)
                relevant_lines.extend(lines[start:end])
                relevant_lines.append("---")

        if relevant_lines:
            result = '\n'.join(relevant_lines[:500])  # Limit size
            log(f"Found {len(relevant_lines)} relevant lines")
            return result
        else:
            return "No specific documentation found. Please refer to general AlgoKit commands: algokit init, algokit project run build, algokit project deploy localnet"
    except Exception as e:
        error_msg = f"Error searching documentation: {str(e)}"
        log(error_msg)
        return error_msg
