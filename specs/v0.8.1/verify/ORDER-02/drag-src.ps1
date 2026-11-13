#Requires -Version 7
# Helper for ext-drop.ps1: a small topmost window that starts an OLE file drag (like Explorer) when the left button goes down on it.
param([string]$Joined, [string]$ReadyFile)
$ErrorActionPreference = 'Stop'
$Paths = $Joined.Split('|')
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class DpiH { [DllImport("user32.dll")] public static extern bool SetProcessDPIAware(); [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c); [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint f); }'
[void][DpiH]::SetProcessDPIAware()
$form = New-Object System.Windows.Forms.Form
$form.Text = 'v3-drag-src'; $form.TopMost = $true; $form.FormBorderStyle = 'FixedToolWindow'; $form.StartPosition = 'Manual'
$form.Location = New-Object System.Drawing.Point(1720, 900); $form.ClientSize = New-Object System.Drawing.Size(160, 90)
$form.BackColor = [System.Drawing.Color]::Gold
$result = 'none'
$form.Add_MouseDown({
  $data = New-Object System.Windows.Forms.DataObject
  $list = New-Object System.Collections.Specialized.StringCollection
  $Paths | ForEach-Object { [void]$list.Add($_) }
  $data.SetFileDropList($list)
  $script:result = [string]$form.DoDragDrop($data, [System.Windows.Forms.DragDropEffects]::Copy)
  $form.Close()
})
$form.Add_Shown({
  [void][DpiH]::ShowWindow($form.Handle, 5)
  [void][DpiH]::SetWindowPos($form.Handle, [IntPtr]-1, 0, 0, 0, 0, 0x0043)
  $form.Activate()
  Set-Content -LiteralPath $ReadyFile -Value ("{0} {1} {2} {3} {4}" -f $form.Handle, $form.Left, $form.Top, $form.Width, $form.Height)
})
$timer = New-Object System.Windows.Forms.Timer; $timer.Interval = 20000; $timer.Add_Tick({ $form.Close() }); $timer.Start()
[void]$form.ShowDialog()
Write-Output "effect=$result"
