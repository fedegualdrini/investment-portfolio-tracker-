# Script to switch to testy branch and push changes
Write-Host "Current branch:"
git branch --show-current

Write-Host "`nSwitching to testy branch..."
git checkout testy 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating testy branch..."
    git checkout -b testy
}

Write-Host "`nCurrent branch after switch:"
git branch --show-current

Write-Host "`nStaging changes..."
git add -A

Write-Host "`nStatus:"
git status --short

Write-Host "`nCommitting changes..."
git commit -m "Add Goals and Rebalancing features, fix News Feed links, add translations"

Write-Host "`nPushing to testy branch..."
git push -u origin testy

Write-Host "`nDone!"


