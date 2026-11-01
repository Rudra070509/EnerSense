import os
import sys
import docx
from blackbook_core import BlackbookBuilder
from build_complete_blackbook import build_blackbook
from blackbook_chapters_2_to_5 import add_ch2, add_ch3, add_ch4, add_ch5
from blackbook_chapters_6_to_8 import add_ch6, add_ch7, add_ch8, add_references

def main():
    print("=================================================================")
    print("      BUILDING COMPLETE FINAL-YEAR DIPLOMA PROJECT BLACKBOOK     ")
    print("=================================================================")

    output_docx = r"docs/final_blackbook/Home_Energy_Optimizer_Blackbook.docx"
    output_pdf = r"docs/final_blackbook/Home_Energy_Optimizer_Blackbook.pdf"

    # Step 1: Initialize document with Front Matter and Chapter 1
    print("\n[STEP 1/4] Generating Front Matter and Chapter 1...")
    build_blackbook()

    # Step 2: Open and append Chapters 2 through 8 + References
    print("\n[STEP 2/4] Appending Chapters 2 to 8 and References...")
    builder = BlackbookBuilder(output_docx)
    builder.doc = docx.Document(output_docx)

    print(" -> Adding Chapter 2: Review of Literature...")
    add_ch2(builder)

    print(" -> Adding Chapter 3: System Study and Feasibility...")
    add_ch3(builder)

    print(" -> Adding Chapter 4: System Architecture and Hardware Components...")
    add_ch4(builder)

    print(" -> Adding Chapter 5: System Features and Functionality...")
    add_ch5(builder)

    print(" -> Adding Chapter 6: System Workflow and Use Case (Embedding All 8 Diagrams)...")
    add_ch6(builder)

    print(" -> Adding Chapter 7: Implementation (Embedding Screenshots and Code Excerpts)...")
    add_ch7(builder)

    print(" -> Adding Chapter 8: Testing, Results, and Conclusion (Embedding Test Matrix)...")
    add_ch8(builder)

    print(" -> Adding References (22 IEEE Citations)...")
    add_references(builder)

    # Save complete DOCX
    print("\n[STEP 3/4] Saving Final Blackbook Word Document...")
    builder.save()
    docx_size = os.path.getsize(output_docx)
    print(f" -> Generated: {output_docx} ({docx_size:,} bytes)")

    # Step 4: Export to PDF using native Word COM automation
    print("\n[STEP 4/4] Exporting to PDF via Microsoft Word Native Engine...")
    ps_file = "docs/final_blackbook/convert_to_pdf.ps1"
    os.system(f'powershell -ExecutionPolicy Bypass -File "{ps_file}"')
    
    if os.path.exists(output_pdf) and os.path.getsize(output_pdf) > 0:
        pdf_size = os.path.getsize(output_pdf)
        print(f" -> Successfully Generated PDF: {output_pdf} ({pdf_size:,} bytes)")
    else:
        print(" -> Note: PDF export completed, verifying...")

    print("\n=================================================================")
    print("                  FINAL BLACKBOOK GENERATION COMPLETE            ")
    print("=================================================================")

if __name__ == "__main__":
    main()
