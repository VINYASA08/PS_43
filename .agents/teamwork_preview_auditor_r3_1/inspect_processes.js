const { execSync } = require('child_process');
try {
  const output = execSync('powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name = \'node.exe\'\\" | ForEach-Object { $_.ProcessId.ToString() + \' \' + $_.CommandLine }"', { encoding: 'utf-8' });
  console.log(output);
} catch (e) {
  console.error(e.message);
}
