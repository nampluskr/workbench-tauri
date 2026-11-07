#!/usr/bin/env bash
# Shell Script sample.
set -euo pipefail

readonly LIMIT=40
name="${1:-world}"
files=(*.md)

greet() {
  local who="$1"
  printf 'Hello, %s\n' "$who"
}

if [[ ${#files[@]} -gt 0 && -f "${files[0]}" ]]; then
  echo "found ${#files[@]} files"
else
  echo "none" >&2
fi

for i in $(seq 1 3); do
  count=$((i * LIMIT))
  echo "step $i -> $count"
done

case "$name" in
  world) greet "$name" ;;
  *) greet "friend" ;;
esac

today=$(date +%Y-%m-%d)
cat <<EOF
Today is $today
EOF
