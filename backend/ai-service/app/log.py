"""
log.py — Console output that can never take down a request.

Resume text and LLM replies routinely contain characters the Windows console
codepage cannot encode. A bare `print` of that text raises UnicodeEncodeError,
and inside an exception handler that crash replaces the error it was reporting.
"""
import sys


def log(message) -> None:
    """Print a diagnostic line, degrading unencodable characters."""
    try:
        print(message)
    except UnicodeEncodeError:
        encoding = getattr(sys.stdout, "encoding", None) or "ascii"
        print(str(message).encode(encoding, "replace").decode(encoding, "replace"))
    except Exception:                                           # noqa: BLE001
        pass                                                    # logging must never raise


def use_utf8_console() -> None:
    """Switch stdout/stderr to UTF-8 where the platform allows it."""
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:                                       # noqa: BLE001
            pass
