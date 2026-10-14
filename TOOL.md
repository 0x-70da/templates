```bash
function new-project {
    param([string]$Name)

    $workspace = "E:\Workspace"
    $repo      = "gh:0x-70da/templates"

    $templates = [ordered]@{
        "1" = @{ Label = "React";           Dir = "react" }
        "2" = @{ Label = "Next.js";         Dir = "next" }
        "3" = @{ Label = "Express";         Dir = "express" }
        "4" = @{ Label = "React + Express"; Dir = "react-express" }
    }

    if (-not $Name) { $Name = Read-Host "Project name" }
    if (-not $Name) { Write-Host "Name is required" -ForegroundColor Red; return }

    $target = Join-Path $workspace $Name
    if (Test-Path $target) {
        Write-Host "Folder already exists: $target" -ForegroundColor Red; return
    }

    Write-Host "`nChoose a template:" -ForegroundColor Cyan
    $templates.GetEnumerator() | ForEach-Object {
        Write-Host "  $($_.Key). $($_.Value.Label)"
    }

    $choice = Read-Host "`nNumber"
    if (-not $templates.Contains($choice)) {
        Write-Host "Invalid choice" -ForegroundColor Red; return
    }

    $dir = $templates[$choice].Dir
    pnpm dlx giget@latest "$repo/$dir" $target
    if ($LASTEXITCODE -ne 0) { Write-Host "Download failed" -ForegroundColor Red; return }

    Set-Location $target
    git init
    if (Test-Path ".env.example") { Copy-Item ".env.example" ".env" }
    pnpm install

    Write-Host "`nDone: $target" -ForegroundColor Green
}
```
