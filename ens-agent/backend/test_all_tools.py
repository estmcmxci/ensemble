"""Test all 16 agent tools via ChatKit endpoint."""

import json
import sys
import time
import httpx

CHATKIT_URL = "http://localhost:8000/chatkit"

TESTS = [
    # --- 9 READ TOOLS ---
    ("ens_check", "Is the name cooltestxyz987.eth available for registration on sepolia? Check for a 1 year duration."),
    ("ens_profile", "Show me the full profile for nick.eth on mainnet."),
    ("ens_resolve", "Resolve the email text record for nick.eth on mainnet."),
    ("ens_list", "List all ENS names owned by address 0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5 on mainnet."),
    ("ens_verify", "Verify the records for nick.eth on mainnet."),
    ("ens_namehash", "What is the namehash of vitalik.eth?"),
    ("ens_labelhash", "What is the labelhash of the label vitalik?"),
    ("ens_resolver", "What resolver contract does nick.eth use on mainnet?"),
    ("ens_deployments", "Show me all ENS contract deployment addresses for both networks."),
    # --- 7 WRITE TOOLS ---
    # Prompts are very direct to minimize extra tool calls and token usage
    ("ens_build_commit_tx", "Build the commit transaction to register testxyz99887.eth for owner 0xAbCdEf0123456789AbCdEf0123456789AbCdEf01 on sepolia. Duration 1y. Do not check availability first, just build the commit tx."),
    ("ens_build_register_tx", "Build the register transaction for session ID 550e8400-e29b-41d4-a716-446655440000. Do not check anything else, just call ens_build_register_tx with this session ID."),
    ("ens_build_set_records_tx", 'Build a set records transaction for testxyz99887.eth on sepolia with text records: {"email":"test@example.com","com.twitter":"@testuser"}. Just build it directly.'),
    ("ens_build_renew_tx", "Build a renew transaction for label nick, duration 2y, on sepolia. Just call ens_build_renew_tx directly."),
    ("ens_build_transfer_tx", "Build a transfer transaction for label testxyz99887 from 0xAbCdEf0123456789AbCdEf0123456789AbCdEf01 to 0x1111111111111111111111111111111111111111 on sepolia. Just call ens_build_transfer_tx directly."),
    ("ens_build_primary_tx", "Build a set primary name transaction for name nick.eth, address 0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5, owner 0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5, on sepolia. Call ens_build_primary_tx directly."),
    ("ens_build_subname_tx", "Build transactions to create subname sub under parent testxyz99887.eth, owner 0xAbCdEf0123456789AbCdEf0123456789AbCdEf01, address 0xAbCdEf0123456789AbCdEf0123456789AbCdEf01, on sepolia. Call ens_build_subname_tx directly."),
]


def send_message(text: str) -> tuple[str, bool]:
    """Send a message to ChatKit and return the final assistant text + success flag."""
    payload = {
        "type": "threads.create",
        "params": {
            "input": {
                "content": [{"type": "input_text", "text": text}],
                "attachments": [],
                "inference_options": {"tool_choice": None, "model": None},
            }
        },
        "metadata": {},
    }

    try:
        with httpx.Client(timeout=120) as client:
            with client.stream("POST", CHATKIT_URL, json=payload) as resp:
                final_text = ""
                has_error = False
                for line in resp.iter_lines():
                    if not line.startswith("data: "):
                        continue
                    data = json.loads(line[6:])

                    if data.get("type") == "error":
                        has_error = True

                    # Extract final done message text
                    if data.get("type") == "thread.item.done":
                        item = data.get("item", {})
                        if item.get("type") == "assistant_message":
                            content = item.get("content", [])
                            for part in content:
                                if part.get("type") == "output_text":
                                    final_text = part.get("text", "")

                return final_text, not has_error
    except Exception as e:
        return f"ERROR: {e}", False


def main():
    passed = 0
    failed = 0
    results = []

    # Allow filtering: python test_all_tools.py write (runs only write tools)
    filter_arg = sys.argv[1] if len(sys.argv) > 1 else None
    tests_to_run = TESTS
    if filter_arg == "write":
        tests_to_run = [t for t in TESTS if t[0].startswith("ens_build")]
    elif filter_arg == "read":
        tests_to_run = [t for t in TESTS if not t[0].startswith("ens_build")]

    for i, (tool_name, prompt) in enumerate(tests_to_run):
        if i > 0:
            sys.stdout.write("  (waiting 10s for rate limit...)\n")
            sys.stdout.flush()
            time.sleep(10)

        sys.stdout.write(f"\n{'='*60}\n")
        sys.stdout.write(f"Testing: {tool_name}\n")
        sys.stdout.write(f"Prompt: {prompt[:80]}...\n")
        sys.stdout.flush()

        text, success = send_message(prompt)

        if success and text:
            status = "PASS"
            passed += 1
        else:
            status = "FAIL"
            failed += 1

        preview = text[:200].replace("\n", " ") if text else "(empty)"
        sys.stdout.write(f"Status: {status}\n")
        sys.stdout.write(f"Response: {preview}...\n")
        sys.stdout.flush()

        results.append((tool_name, status, preview))

    print(f"\n{'='*60}")
    print(f"RESULTS: {passed} passed, {failed} failed out of {len(TESTS)}")
    print(f"{'='*60}")
    for tool_name, status, preview in results:
        marker = "✓" if status == "PASS" else "✗"
        print(f"  {marker} {tool_name}: {status}")

    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
