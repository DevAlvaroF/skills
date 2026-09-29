#!/bin/sh
# check-tracker-contract.sh <expected> [<project-root>]
#
# Checks that <project-root>/.mysdd/issue-tracker.md (CR stripped) holds exactly one
# `Tracker contract` line, that it reads `Tracker contract: <digits>`, and that the
# number equals <expected>. Leading zeros compare numerically: `Tracker contract: 04`
# matches 4. <project-root> defaults to `git rev-parse --show-toplevel` run from the
# current directory, so a skill can call it without a command substitution. Skills
# invoke it as `sh check-tracker-contract.sh ...` because installed copies are mode 644.
# On a mismatch it prints what it found against what it expected, and which side is
# behind, to stdout; the calling skill adds the remedy.
#
# Exit: 0 match (silent) | 1 tracker missing, damaged or behind | 3 skill behind
#       2 usage, or no <project-root> given outside a Git work tree

usage() { echo 'usage: sh check-tracker-contract.sh <expected> [<project-root>]' >&2; exit 2; }
num() { printf '%s\n' "$1" | sed 's/^0*\([0-9]\)/\1/'; }

[ "$#" -eq 1 ] || { [ "$#" -eq 2 ] && [ -n "$2" ]; } || usage
case "$1" in '' | *[!0-9]*) usage ;; esac
expected=$(num "$1")
if [ "$#" -eq 2 ]; then
  root=$2
elif ! root=$(git rev-parse --show-toplevel 2>/dev/null) || [ -z "$root" ]; then
  echo 'check-tracker-contract.sh: not inside a Git work tree; pass <project-root>' >&2
  exit 2
fi
file="$root/.mysdd/issue-tracker.md"
want="Tracker contract: $expected"

if [ ! -f "$file" ] || [ ! -r "$file" ]; then
  printf 'found:    no readable tracker file at %s\nexpected: %s\n' "$file" "$want"
  echo 'The tracker is missing.'
  exit 1
fi

all=$(tr -d '\r' < "$file" | grep -c '^Tracker contract')
good=$(tr -d '\r' < "$file" | grep -cE '^Tracker contract: [0-9]+$')
if [ "$all" -ne 1 ] || [ "$good" -ne 1 ]; then
  echo "found:    $all 'Tracker contract' line(s) in $file"
  tr -d '\r' < "$file" | grep '^Tracker contract' | sed "s/.*/          '&'/"
  echo "expected: exactly one line '$want'"
  echo 'The tracker is behind: it is damaged or predates tracker contracts.'
  exit 1
fi

line=$(tr -d '\r' < "$file" | grep '^Tracker contract')
found=$(num "${line#Tracker contract: }")
[ "$found" -eq "$expected" ] && exit 0
printf "found:    '%s' in %s\nexpected: '%s'\n" "$line" "$file" "$want"
if [ "$found" -lt "$expected" ]; then
  echo 'The tracker is behind: it predates the contract this skill expects.'
  exit 1
fi
echo 'The skill is behind: the tracker is newer than this skill, so the skills need updating.'
exit 3
