# Formatting and size checks for skills/. `make check` runs both.
#
# oxfmt is pinned so a release can't reformat every file on its own. Tables
# carry <!-- oxfmt-ignore -->: padding them costs ~4.9 KB and breaks the size
# budget. .oxfmtrc.json leaves code blocks alone, since the format examples
# in them are what agents copy, and matches the Makerkit projects' oxfmt
# (single quotes, width 80), whose check failed on an installed openai.yaml.

OXFMT := npx -y oxfmt@0.72.0
PROMPT_KANBAN ?= ../prompt-kanban
PK := $(abspath $(PROMPT_KANBAN))
BUDGET_TEST := $(PK)/tests/unit/domain/skills-size-budget.test.ts

.PHONY: check fmt fmt-check budget

check: fmt-check budget

fmt:
	$(OXFMT) skills

fmt-check:
	$(OXFMT) --check skills

# prompt-kanban's budget test reads its own vendor/skills checkout; run a copy
# pointed at this one, so the budget checks the files you are editing.
budget:
	@test -f "$(BUDGET_TEST)" || { echo "No budget test at $(BUDGET_TEST); set PROMPT_KANBAN=<path>"; exit 1; }
	@set -e; tmp=$$(mktemp -d); trap 'rm -rf "$$tmp"' EXIT; \
	sed "s|new URL('../../../vendor/skills/skills/', import.meta.url)|new URL('file://$(CURDIR)/skills/')|" \
		"$(BUDGET_TEST)" > "$$tmp/budget.test.ts"; \
	grep -q "file://$(CURDIR)/skills/" "$$tmp/budget.test.ts" || { echo "Budget test no longer reads vendor/skills/skills/; update the Makefile"; exit 1; }; \
	echo '{}' > "$$tmp/package.json"; ln -s "$(PK)/node_modules" "$$tmp/node_modules"; \
	"$(PK)/node_modules/.bin/vitest" run --root "$$tmp" budget.test.ts
