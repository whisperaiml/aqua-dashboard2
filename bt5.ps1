# === Settings ===
$source = Get-Location
$temp = "$env:TEMP\zip-staging"
$destination = "$source\my-dash-band.zip"
$excludeDirs = @("node_modules", ".next", ".git")

# === Cleanup and create temp
Remove-Item -Recurse -Force $temp -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $temp | Out-Null

# === Copy allowed content
Get-ChildItem -Path $source -Recurse -Force | Where-Object {
    $isExcluded = $false
    foreach ($exDir in $excludeDirs) {
        if ($_.FullName -like "*\$exDir\*") {
            $isExcluded = $true
            break
        }
    }
    return -not $isExcluded
} | ForEach-Object {
    $targetPath = $_.FullName.Replace($source, $temp)
    $targetDir = Split-Path $targetPath
    if (!(Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    Copy-Item $_.FullName -Destination $targetPath -Force
}

# === Zip the staged copy
Compress-Archive -Path "$temp\*" -DestinationPath $destination -Force

# === Clean up
Remove-Item -Recurse -Force $temp

Write-Host "✅ Zipped project to $destination excluding $($excludeDirs -join ', ')"
