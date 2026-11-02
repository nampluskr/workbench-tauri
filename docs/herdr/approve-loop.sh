# usage: approve-loop.sh <agent> <pane> ; approves blocked prompts unless dangerous keywords visible
A=$1; P=$2
for i in $(seq 1 40); do
  herdr agent wait $A --until working --timeout 20000 >/dev/null 2>&1
  st=$(herdr agent wait $A --until done --until blocked --until idle --timeout 580000 2>&1 | grep -o '"agent_status":"[a-z]*"' | head -1)
  if ! echo "$st" | grep -q blocked; then echo "END $st approvals=$((i-1))"; exit 0; fi
  scr=$(herdr pane read $P --source visible --lines 80)
  if echo "$scr" | grep -qiE 'Remove-Item|rm -rf|\brm |\bdel |rmdir|git (push|commit|reset|checkout|clean|remote)|npm (install|i |uninstall)|cargo (add|install)|Stop-Process|taskkill|Set-ExecutionPolicy|Invoke-WebRequest|curl |winget|Format-'; then echo "STOP"; echo "$scr" | grep -v '^\s*$' | tail -30; exit 1; fi
  herdr pane send-keys $P enter >/dev/null
done
echo "LOOP LIMIT"
