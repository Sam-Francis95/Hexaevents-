"""
Server-side eligibility evaluation. This is deliberately NEVER trusted from
the client — the Register button being disabled in the UI is a courtesy,
not the actual gate. The real gate is this function, re-run again inside
the registration endpoint itself before any registration is created.
"""

_RULE_FIELD_MAP = {
    "department": "department",
    "batch": "batch",
    "role": "role",
    "college": "college",
}

_RULE_LABEL_MAP = {
    "department": "department",
    "batch": "batch",
    "role": "role",
    "college": "college",
}


def evaluate_eligibility(user, event):
    rules = event.get("eligibilityRules", [])
    if not rules:
        return True, []

    reasons = []
    for rule in rules:
        rule_type = rule.get("ruleType")
        rule_value = rule.get("ruleValue")
        field = _RULE_FIELD_MAP.get(rule_type)
        if not field:
            continue  # unknown rule type — fail open rather than block registration on a typo
        if user.get(field) != rule_value:
            label = _RULE_LABEL_MAP.get(rule_type, rule_type)
            reasons.append(f"Restricted to {label}: {rule_value}.")

    return (len(reasons) == 0), reasons
