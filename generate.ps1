$logFile = "log.txt"
"Start log - $(Get-Date)" | Out-File -FilePath $logFile

try {
    "Check git version" | Out-File -FilePath $logFile -Append
    git --version | Out-File -FilePath $logFile -Append
    
    "Check current count" | Out-File -FilePath $logFile -Append
    $count = (git rev-list --count HEAD)
    "Current count: $count" | Out-File -FilePath $logFile -Append
    
    $target = 505
    if ([int]$count -lt $target) {
        $needed = $target - [int]$count
        "Generating $needed commits..." | Out-File -FilePath $logFile -Append
        
        for ($i=1; $i -le $needed; $i++) {
            $current = [int]$count + $i
            "Commit $current at $(Get-Date)" | Out-File -FilePath "commit_count.txt" -Append
            git add commit_count.txt
            git commit -m "chore: increment commit count [$current]"
            if ($i % 50 -eq 0) {
                "Generated $i/$needed commits..." | Out-File -FilePath $logFile -Append
            }
        }
        "Done!" | Out-File -FilePath $logFile -Append
    } else {
        "Already have 505+ commits." | Out-File -FilePath $logFile -Append
    }
} catch {
    "ERROR: $_" | Out-File -FilePath $logFile -Append
}
