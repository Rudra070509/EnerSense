$docxPath = "C:\EnerSense\docs\final_blackbook\Home_Energy_Optimizer_Blackbook.docx"
$pdfPath = "C:\EnerSense\docs\final_blackbook\Home_Energy_Optimizer_Blackbook.pdf"
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Open($docxPath)
    $wdFormatPDF = 17
    $doc.SaveAs([ref]$pdfPath, [ref]$wdFormatPDF)
    $doc.Close()
    $word.Quit()
    Write-Host "PDF Export SUCCESS: $pdfPath"
} catch {
    Write-Host "PDF Export FAILED: " $_.Exception.Message
}
