#!/bin/sh
# commit-route.sh — the Commit Route: every commit a Skill makes goes through it.
#
#   sh <skill dir>/scripts/commit-route.sh commit --subject <subject> [--paragraph <text>]... -- <path>...
#
# Commits exactly the given paths, repository-root-relative, with the user's hooks
# running, and proves the commit holds exactly them. The root is found with
# `git rev-parse --show-toplevel` from the current directory, so any subdirectory or
# linked worktree works. `--subject` is required once: one line, not empty. Each
# `--paragraph` becomes one more paragraph of the message, in order, kept byte for byte
# (no cleanup); nothing is added to the message. A path is committed only when it
# differs from HEAD (blob or mode, additions and deletions included); an index-only
# difference never counts, and a path found in neither HEAD nor the work tree stops the
# call. A rename commits by naming both paths. The route never amends, resets the branch, retries, pushes, stashes or
# searches history. Installed copies are mode 644, so always run it with `sh`.
#
# stdout carries only `key: value` lines; every Git and hook message goes to stderr.
#   result: committed | nothing-to-commit | stopped | failed-isolation | unverified
#           exactly once
#   sha:     the commit, at most once; recordable only with `result: committed`
#   path:    a requested path the result is about (unchanged, or refused)
#   foreign: a committed path that was not requested
#   note:    context that does not change the result
#   reason:  why the call stopped
# A value holding `"`, `\` or a control byte is written Git-style C-quoted: wrapped in
# double quotes, with \\ \" \a \b \t \n \v \f \r and \ooo octal for other controls.
#
# Exit: 0 committed | 1 stopped, nothing published (staging may have happened)
#       2 usage, nothing changed | 3 nothing to commit | 4 failed isolation, the sha a
#       diagnostic only | 5 published or not ruled out, but unverified, the sha a
#       diagnostic only

# Protocol lines go to fd 3 alone; everything else, Git and hooks included, to stderr.
exec 3>&1 1>&2

nl='
'
cr=$(printf '\r')
queued=''
sha=''

# The one encoder: prints $1 raw, or Git-style C-quoted when it holds `"`, `\` or a
# control byte. Bytes from 0x80 up stay raw, as Git prints them with core.quotePath off.
cquote() {
  _format=$(printf '%s' "$1" | LC_ALL=C od -An -v -to1 | LC_ALL=C awk '
    function dec(o) { return (substr(o, 1, 1) * 64) + (substr(o, 2, 1) * 8) + substr(o, 3, 1) }
    { for (i = 1; i <= NF; i++) byte[n++] = $i }
    END {
      named[7] = "a"; named[8] = "b"; named[9] = "t"; named[10] = "n"
      named[11] = "v"; named[12] = "f"; named[13] = "r"
      for (i = 0; i < n; i++) {
        v = dec(byte[i])
        if (v < 32 || v == 127 || v == 34 || v == 92) quote = 1
      }
      if (!quote) { printf "R"; exit }
      # A printf format for the shell: \\ prints one backslash, \ooo one raw byte.
      out = "Q\""
      for (i = 0; i < n; i++) {
        v = dec(byte[i])
        if (v == 34) out = out "\\\\\""
        else if (v == 92) out = out "\\\\\\\\"
        else if (v in named) out = out "\\\\" named[v]
        else if (v < 32 || v == 127) out = out "\\\\" byte[i]
        else if (v > 127) out = out "\\" byte[i]
        else if (v == 37) out = out "%%"
        else out = out sprintf("%c", v)
      }
      printf "%s\"", out
    }')
  case $_format in
    R) printf '%s' "$1" ;;
    *) printf "${_format#Q}" ;;
  esac
}

# Queues one protocol line; `finish` prints them all after `result:` and `sha:`.
emit() {
  emit_encoded "$1" "$(cquote "$2")"
}

# Queues a line whose value is already encoded, as Git's own quoted path output is.
emit_encoded() {
  queued="$queued$1: $2$nl"
}

# The one place a result becomes an exit code. `finish stopped 2` is a usage error.
finish() {
  case $1 in
    committed) code=0 ;;
    stopped) code=${2:-1} ;;
    nothing-to-commit) code=3 ;;
    failed-isolation) code=4 ;;
    unverified) code=5 ;;
    *) code=1 ;;
  esac
  printf 'result: %s\n' "$1" >&3
  [ -z "$sha" ] || printf 'sha: %s\n' "$sha" >&3
  printf '%s' "$queued" >&3
  exit "$code"
}

usage() {
  emit reason "$1"
  emit note 'usage: sh commit-route.sh commit --subject <subject> [--paragraph <text>]... -- <path>...'
  finish stopped 2
}

stop() {
  emit reason "$1"
  finish stopped
}

# ---- arguments: all checked before Git is touched -------------------------------

[ "$#" -gt 0 ] || usage 'missing subcommand'
case $1 in
  commit) shift ;;
  *) usage "unknown subcommand: $1" ;;
esac

subject=''
subject_given=''
paragraphs=0
separated=''
while [ "$#" -gt 0 ]; do
  case $1 in
    --subject)
      [ "$#" -ge 2 ] || usage '--subject needs a value'
      [ -z "$subject_given" ] || usage '--subject given more than once'
      subject=$2
      subject_given=1
      shift 2
      ;;
    --paragraph)
      [ "$#" -ge 2 ] || usage '--paragraph needs a value'
      paragraphs=$((paragraphs + 1))
      eval "paragraph_$paragraphs=\$2"
      shift 2
      ;;
    --)
      separated=1
      shift
      break
      ;;
    *) usage "unknown option: $1" ;;
  esac
done

[ -n "$subject_given" ] || usage 'missing --subject'
[ -n "$subject" ] || usage 'the subject is empty'
case $subject in
  *"$nl"* | *"$cr"*) usage 'the subject spans more than one line' ;;
esac
[ -n "$separated" ] || usage 'missing -- before the paths'
[ "$#" -gt 0 ] || usage 'no paths given'
for path do
  [ -n "$path" ] || usage 'an empty path'
done

# ---- repository and HEAD --------------------------------------------------------

root=$(git rev-parse --show-toplevel) && [ -n "$root" ] || stop 'not inside a Git work tree'
cd "$root" || stop 'cannot enter the repository root'

# Sets `tip` to the object id of the noted branch, or to empty when that exact ref
# is proven absent. Fails when the ref cannot be read, or names no commit.
read_branch_tip() {
  _refs=$(git for-each-ref --format='%(objectname) %(objecttype) %(refname)' "$1") || return 1
  tip=''
  while IFS=' ' read -r _oid _type _ref; do
    [ "$_ref" = "$1" ] || continue
    [ "$_type" = commit ] || return 1
    tip=$_oid
  done <<EOF
$_refs
EOF
  return 0
}

# Sets `tip` to what HEAD now names: the noted branch's tip, or the detached HEAD.
read_tip() {
  if [ -n "$head_ref" ]; then
    read_branch_tip "$head_ref"
  else
    tip=$(git rev-parse -q --verify 'HEAD^{commit}')
  fi
}

head_ref=$(git symbolic-ref -q HEAD)
case $? in
  0)
    read_branch_tip "$head_ref" || stop "cannot read $head_ref"
    head_oid=$tip
    ;;
  1)
    head_ref=''
    read_tip && [ -n "$tip" ] || stop 'cannot read the detached HEAD'
    head_oid=$tip
    emit note "HEAD is detached at $head_oid; the commit goes onto it"
    ;;
  *) stop 'cannot read HEAD' ;;
esac

# ---- what changed, decided before anything is staged ----------------------------

filemode=$(git config --bool core.fileMode)
case $? in
  0) ;;
  1) filemode=true ;;
  *) stop 'cannot read core.fileMode' ;;
esac

tab=$(printf '\t')

# Prints "<mode> <object id>" for $1 in the noted parent, or nothing when absent.
parent_entry() {
  [ -n "$head_oid" ] || return 0
  _entry=$(git --literal-pathspecs ls-tree "$head_oid" -- "$1") || return 1
  _entry=${_entry%%"$tab"*}
  [ -z "$_entry" ] || printf '%s %s' "${_entry%% *}" "${_entry##* }"
}

# Prints "<mode> <object id>" for what `add` would stage from $1, or nothing when
# absent, hashing without staging. Fails on a directory or an unreadable path.
worktree_entry() {
  if [ -L "$1" ]; then
    _link=$(readlink -- "$1") || return 1
    _oid=$(printf '%s' "$_link" | git hash-object --stdin) || return 1
    printf '120000 %s' "$_oid"
  elif [ -d "$1" ]; then
    return 2
  elif [ -e "$1" ]; then
    _oid=$(git hash-object -- "$1") || return 1
    if [ "$filemode" = true ]; then
      case $(ls -ld -- "$1") in
        ???[xs]*) _mode=100755 ;;
        *) _mode=100644 ;;
      esac
    else
      _staged=$(git --literal-pathspecs ls-files -s -- "$1") || return 1
      case $_staged in
        100755*) _mode=100755 ;;
        *) _mode=100644 ;;
      esac
    fi
    printf '%s %s' "$_mode" "$_oid"
  fi
}

changed=0
unchanged=0
unchanged_paths=''
for path do
  was=$(parent_entry "$path") || stop 'cannot read the parent tree'
  now=$(worktree_entry "$path")
  case $? in
    0) ;;
    2)
      emit path "$path"
      stop 'a directory cannot be committed; name its files'
      ;;
    *)
      emit path "$path"
      stop 'cannot read the path in the work tree'
      ;;
  esac
  if [ -z "$was" ] && [ -z "$now" ]; then
    emit path "$path"
    stop 'the path is in neither HEAD nor the work tree'
  elif [ "$was" = "$now" ]; then
    unchanged=$((unchanged + 1))
    unchanged_paths="$unchanged_paths$path$nl"
  else
    changed=$((changed + 1))
  fi
done

[ "$changed" -gt 0 ] || finish nothing-to-commit
if [ "$unchanged" -gt 0 ]; then
  while IFS= read -r path; do
    [ -z "$path" ] || emit path "$path"
  done <<EOF
$unchanged_paths
EOF
  stop 'some paths are unchanged against HEAD; commit only the changed ones'
fi

# ---- stage and commit -----------------------------------------------------------

for path do
  if [ -e "$path" ] || [ -L "$path" ]; then
    if ! git --literal-pathspecs add -- "$path"; then
      emit path "$path"
      emit note 'staging may be partial; nothing was rolled back'
      stop 'git add failed'
    fi
  fi
done

messages=''
i=1
while [ "$i" -le "$paragraphs" ]; do
  messages="$messages -m \"\$paragraph_$i\""
  i=$((i + 1))
done

# --cleanup=verbatim: the message is the Skill's, byte for byte, whatever commit.cleanup says.
eval "git --literal-pathspecs commit --only --cleanup=verbatim -m \"\$subject\" $messages -- \"\$@\""
committed=$?

# ---- verify the one candidate ---------------------------------------------------

if ! read_tip; then
  emit reason 'cannot read HEAD after the commit'
  finish unverified
fi
if [ "$tip" = "$head_oid" ]; then
  [ "$committed" -eq 0 ] || stop 'git commit failed; HEAD did not move'
  emit reason 'git commit reported success but HEAD did not move'
  finish unverified
fi
sha=$tip
if [ "$committed" -ne 0 ]; then
  emit reason 'git commit failed but HEAD moved'
  finish unverified
fi

object=$(git cat-file commit "$sha") || {
  emit reason 'cannot read the new commit'
  finish unverified
}
parents=$(printf '%s\n' "$object" | awk '/^$/ { exit } /^parent / { print $2 }')
if [ "$parents" != "$head_oid" ]; then
  emit reason 'the new commit does not sit directly on the noted HEAD'
  finish unverified
fi
got_subject=$(printf '%s\n' "$object" | awk 'body { print; exit } /^$/ { body = 1 }')
if [ "$got_subject" != "$subject" ]; then
  emit reason 'the new commit does not carry the given subject'
  finish unverified
fi

# Git prints each path C-quoted exactly as `cquote` encodes it, so the sets compare as lines.
held=$(git -c core.quotePath=false diff-tree --root --no-commit-id --name-only -r --no-renames "$sha") || {
  emit reason 'cannot list the paths the new commit holds'
  finish unverified
}
requested=''
for path do
  requested="$requested$(cquote "$path")$nl"
done

# Queues a `$1:` line for each line of $2 that is not a line of $3; fails when none.
emit_difference() {
  _found=1
  while IFS= read -r _line; do
    [ -n "$_line" ] || continue
    case "$nl$3$nl" in
      *"$nl$_line$nl"*) ;;
      *)
        emit_encoded "$1" "$_line"
        _found=0
        ;;
    esac
  done <<EOF
$2
EOF
  return "$_found"
}

if emit_difference foreign "$held" "$requested"; then
  emit reason 'the commit holds paths that were not requested'
  finish failed-isolation
fi

if emit_difference path "$requested" "$held"; then
  emit reason 'the commit lacks requested paths'
  finish unverified
fi

finish committed
