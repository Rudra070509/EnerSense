import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
from blackbook_core import BlackbookBuilder

def build_blackbook():
    output_docx = r"docs/final_blackbook/Home_Energy_Optimizer_Blackbook.docx"
    builder = BlackbookBuilder(output_docx)
    doc = builder.doc

    # =========================================================================
    # FRONT MATTER
    # =========================================================================
    
    # 1. COVER PAGE
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(36)
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run("Project Report\nOn\n")
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(71, 85, 105)

    r_title = p.add_run("HOME ENERGY OPTIMIZER\n(EnerSense)\n")
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(12)
    p_sub.paragraph_format.space_after = Pt(24)
    r_sub = p_sub.add_run(
        "Submitted in partial fulfillment of the requirements for the award of the\n"
        "DIPLOMA IN COMPUTER ENGINEERING\n"
    )
    r_sub.font.size = Pt(12)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(30, 41, 59)

    p_by = doc.add_paragraph()
    p_by.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_by.paragraph_format.space_after = Pt(24)
    r_by = p_by.add_run("By\n\n")
    r_by.font.size = Pt(11)
    r_by.font.italic = True
    
    students = [
        ("Farhan Baig", "Roll No: B003"),
        ("Rudra Shetye", "Roll No: B059"),
        ("Arif Chaudhary", "Roll No: B065")
    ]
    for name, roll in students:
        r_name = p_by.add_run(f"{name} ({roll})\n")
        r_name.font.size = Pt(12)
        r_name.font.bold = True
        r_name.font.color.rgb = RGBColor(15, 23, 42)

    p_guide = doc.add_paragraph()
    p_guide.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_guide.paragraph_format.space_after = Pt(36)
    r_g = p_guide.add_run("Under the Guidance of\n")
    r_g.font.size = Pt(11)
    r_g.font.italic = True
    r_gname = p_guide.add_run("Mrs. SHARYU KADAM\nLecturer, Computer Engineering Department\n")
    r_gname.font.size = Pt(12)
    r_gname.font.bold = True
    r_gname.font.color.rgb = RGBColor(15, 23, 42)

    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_after = Pt(0)
    r_inst = p_inst.add_run(
        "Shri Vile Parle Kelavani Mandal's\n"
        "SHRI BHAGUBHAI MAFATLAL POLYTECHNIC\n"
        "Vile Parle (West), Mumbai - 400 056\n"
        "Academic Year: 2025 - 2026\n"
    )
    r_inst.font.size = Pt(11)
    r_inst.font.bold = True
    r_inst.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_page_break()

    # 2. CERTIFICATE PAGE
    p_c1 = doc.add_paragraph()
    p_c1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_c1.paragraph_format.space_before = Pt(20)
    r_ci = p_c1.add_run("SHRI BHAGUBHAI MAFATLAL POLYTECHNIC\nVile Parle (West), Mumbai - 400 056\n\n")
    r_ci.font.size = Pt(13)
    r_ci.font.bold = True
    
    r_ct = p_c1.add_run("CERTIFICATE\n")
    r_ct.font.size = Pt(18)
    r_ct.font.bold = True
    r_ct.font.color.rgb = RGBColor(15, 23, 42)

    builder.add_p(
        "This is to certify that the project report entitled 'Home Energy Optimizer' is a bonafide work carried out by "
        "Farhan Baig (Roll No. B003), Rudra Shetye (Roll No. B059), and Arif Chaudhary (Roll No. B065) in partial fulfilment "
        "of the requirements for the award of the DIPLOMA IN COMPUTER ENGINEERING from Shri Bhagubhai Mafatlal Polytechnic, Mumbai, "
        "during the academic year 2025-2026.\n\n"
        "The project has been carried out under our guidance and supervision and meets the academic and technical standards "
        "laid down by the Board of Technical Examinations and the Department of Computer Engineering.",
        space_after=24
    )

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(36)
    p_sig.paragraph_format.space_after = Pt(12)
    p_sig.add_run("Date: ____________________\nPlace: Mumbai\n\n\n")

    sig_tbl = doc.add_table(rows=1, cols=3)
    sig_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c1, c2, c3 = sig_tbl.rows[0].cells
    c1.text = "_______________________\nMrs. SHARYU KADAM\nProject Guide"
    c2.text = "_______________________\nMr. JANARDHAN KULKARNI\nHead of Department"
    c3.text = "_______________________\nProf. Dr. MOHD. ZAFAR SHAIKH\nPrincipal"
    for c in [c1, c2, c3]:
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in p.runs:
            run.font.size = Pt(9.5)
            run.font.bold = True

    doc.add_page_break()

    # 3. PROJECT APPROVAL SHEET
    p_ap = doc.add_paragraph()
    p_ap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ap.paragraph_format.space_before = Pt(20)
    p_ap.paragraph_format.space_after = Pt(20)
    r_ap = p_ap.add_run("SHRI BHAGUBHAI MAFATLAL POLYTECHNIC\nVile Parle (West), Mumbai - 400 056\n\nPROJECT APPROVAL SHEET\n")
    r_ap.font.size = Pt(15)
    r_ap.font.bold = True

    builder.add_p(
        "THIS IS TO CERTIFY THAT\n\n"
        "The project report entitled 'Home Energy Optimizer' submitted by Farhan Baig (B003), Rudra Shetye (B059), "
        "and Arif Chaudhary (B065) is hereby approved in partial fulfillment of the requirements for the award of the "
        "Diploma Program in Computer Engineering.",
        space_after=24
    )

    builder.add_p("Approved by:", bold_prefix="", space_after=18)
    builder.add_p("1) Internal Examiner: _____________________________    Signature: ____________________", space_after=12)
    builder.add_p("2) External Examiner: _____________________________    Signature: ____________________", space_after=36)
    builder.add_p("Date: ____________________\nPlace: Mumbai", space_after=12)

    doc.add_page_break()

    # 4. STUDENT DECLARATION
    p_dec = doc.add_paragraph()
    p_dec.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dec.paragraph_format.space_before = Pt(20)
    p_dec.paragraph_format.space_after = Pt(20)
    r_dec = p_dec.add_run("DECLARATION\n")
    r_dec.font.size = Pt(16)
    r_dec.font.bold = True

    builder.add_p(
        "We hereby declare that the project entitled 'Home Energy Optimizer' submitted to the Department of Computer Engineering, "
        "Shri Bhagubhai Mafatlal Polytechnic, Mumbai, is an authentic record of original work done by us under the guidance of Mrs. Sharyu Kadam.\n\n"
        "The information, architectural designs, algorithms, code implementations, and experimental results presented in this report "
        "have been developed and verified by us. Due references and acknowledgements have been made wherever materials, libraries, "
        "and hardware components from external sources have been utilized. We understand that any false representation may lead to disciplinary action.",
        space_after=36
    )

    builder.add_p("Date: ____________________\nPlace: Mumbai\n", space_after=24)
    
    dec_tbl = doc.add_table(rows=1, cols=3)
    dec_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c1, c2, c3 = dec_tbl.rows[0].cells
    c1.text = "_______________________\nFarhan Baig\n(Roll No: B003)"
    c2.text = "_______________________\nRudra Shetye\n(Roll No: B059)"
    c3.text = "_______________________\nArif Chaudhary\n(Roll No: B065)"
    for c in [c1, c2, c3]:
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in p.runs:
            run.font.size = Pt(9.5)
            run.font.bold = True

    doc.add_page_break()

    # 5. ACKNOWLEDGEMENT
    builder.add_chapter_title("ACKNOWLEDGEMENT")
    builder.add_p(
        "We express our profound gratitude and heartfelt thanks to our project guide, Mrs. Sharyu Kadam, Lecturer, "
        "Department of Computer Engineering, for her invaluable guidance, continuous encouragement, and constructive critique "
        "throughout the conceptualization, embedded hardware interfacing, and software development of this project.\n\n"
        "We are sincerely grateful to the Head of Department, Computer Engineering, for providing the necessary laboratory resources, "
        "test bench equipment, and academic environment required to carry out our experimental investigations.\n\n"
        "We extend our sincere thanks to the Principal, Shri Bhagubhai Mafatlal Polytechnic, for his constant administrative support "
        "and encouragement towards practical, industry-aligned engineering projects.\n\n"
        "Finally, we wish to express our heartfelt appreciation to our parents, family members, and classmates for their moral support, "
        "patience, and motivation throughout the course of our diploma engineering curriculum.",
        space_after=24
    )

    doc.add_page_break()

    # 6. VISION, MISSION, PEOs, POs, PSOs (SBMP Departmental Standards)
    builder.add_chapter_title("DEPARTMENT OF COMPUTER ENGINEERING", "Institutional Standards, Vision, Mission, PEOs, POs and PSOs")
    
    builder.add_heading_2("Vision of the Department")
    builder.add_p('"Create a sustainable academic environment to produce highly competent computer professionals of the future."')

    builder.add_heading_2("Mission of the Department")
    builder.add_bullet("To expose students to latest tools and technologies in computing.", "M1: ")
    builder.add_bullet("To foster the professional development of students by providing excellence in education.", "M2: ")
    builder.add_bullet("To adapt rapid advancements in computing by engaging students in lifelong learning.", "M3: ")
    builder.add_bullet("To inculcate sound ethical, moral and social values amongst students for the benefit of society.", "M4: ")

    builder.add_heading_2("Program Educational Objectives (PEOs)")
    builder.add_bullet("Identify, design and solve computing problems by applying knowledge in Computer Engineering.", "PEO1: ")
    builder.add_bullet("Promote lifelong learning by integrating academic knowledge and practical applications.", "PEO2: ")
    builder.add_bullet("Depict effective teamwork and practical skills for holistic development.", "PEO3: ")

    builder.add_heading_2("Program Outcomes (POs)")
    builder.add_bullet("Apply knowledge of basic mathematics, science, and engineering fundamentals to solve engineering problems.", "PO1 - Basic & Discipline Specific Knowledge: ")
    builder.add_bullet("Identify and analyse well-defined engineering problems using codified standard methods.", "PO2 - Problem Analysis: ")
    builder.add_bullet("Design solutions for well-defined technical problems and assist with system component design to meet specified needs.", "PO3 - Design & Development of Solutions: ")
    builder.add_bullet("Apply modern engineering tools and appropriate techniques to conduct standard tests and measurements.", "PO4 - Modern Engineering Tools & Experimentation: ")
    builder.add_bullet("Apply appropriate technology in the context of society, sustainability, environment, and ethical practices.", "PO5 - Engineering Practices for Society & Environment: ")
    builder.add_bullet("Use engineering management principles individually, as a team member, or as a leader to manage projects.", "PO6 - Project Management: ")
    builder.add_bullet("Analyze individual needs and engage in updating in the context of technological changes.", "PO7 - Life-long Learning: ")

    builder.add_heading_2("Program Specific Outcomes (PSOs)")
    builder.add_bullet("Demonstrate fundamental knowledge in the areas of Operating Systems, Web Technology, Microprocessor-based systems, and IoT by applying programming skills and developing applications.", "PSO1: ")
    builder.add_bullet("Administer and manage Open Source, Networking, Security, and Database domains to enhance student growth.", "PSO2: ")

    builder.add_heading_2("Course Outcomes (Course Code: PRO190816 - Project)")
    co_headers = ["CO No.", "Course Outcome Description"]
    co_rows = [
        ["CO1", "Identify problem definitions that can be addressed by applying the acquired knowledge and skills."],
        ["CO2", "Plan the activities with a timeline chart, work in groups/teams, and co-ordinate the work."],
        ["CO3", "Select design methodologies and their implementation."],
        ["CO4", "Write the Project Report (Blackbook)."]
    ]
    builder.add_table(co_headers, co_rows, [1.5, 5.5], caption="Course Outcomes Mapping for Diploma Project Work")

    doc.add_page_break()

    # 7. ABSTRACT
    builder.add_chapter_title("ABSTRACT")
    builder.add_p(
        "Unprecedented urbanization, escalating electricity tariffs, and the proliferation of high-power residential appliances "
        "have transformed domestic energy management into a critical economic and environmental concern. Conventional utility "
        "meters function merely as cumulative billing registers, denying consumers real-time visibility into instantaneous wattage, "
        "individual appliance energy burdens, or the impending financial risk of advancing into higher, non-linear tariff slabs. "
        "To resolve this widespread 'bill shock' and bridge the gap between passive telemetry and active management, this project presents "
        "'Home Energy Optimizer' (EnerSense)—an end-to-end, IoT-enabled residential energy monitoring, predictive billing, and load optimization platform.\n\n"
        "The system architecture incorporates an ESP32 DevKit V1 microcontroller interfaced with dual PZEM-004T V3.0 energy monitoring sensors "
        "via dedicated hardware UART serial buses operating at 9600 bps. Using industrial Modbus RTU protocol, the edge controller samples "
        "six core AC electrical parameters: voltage (V), current (A), active power (W), accumulated energy (kWh), grid frequency (Hz), "
        "and power factor (PF) with 0.5% class measurement accuracy. Telemetry is serialized into compact JSON packets and published every "
        "five seconds to the HiveMQ cloud MQTT broker over TCP port 1883. A public WebSockets bridge (port 8000) streams live telemetry directly "
        "into a responsive React 18 single-page web dashboard, completely eliminating intermediary server polling latencies.\n\n"
        "The frontend software integrates an authentic electricity bill estimation engine mathematically modeled on the Maharashtra Electricity "
        "Regulatory Commission (MERC) FY 2024-25 Category LT-I (B) residential tariff order. The engine computes daily run-rates, projects 30-day "
        "consumption, and calculates charges across four telescopic slabs (Rs 3.15, Rs 5.40, Rs 7.10, and Rs 8.15/kWh), flat wheeling fees (Rs 2.60/kWh), "
        "consumption-tiered fixed demand charges (Rs 90, Rs 135, and Rs 160/month), Fuel Adjustment Cost (FAC at Rs 0.35/kWh), dynamic Time-of-Day (TOD) "
        "incentives/surcharges, and statutory 16% state electricity duty. To deliver actionable intelligence, the platform integrates the Google Gemini "
        "generative AI API (`gemini-3.5-flash`), injecting real-time electrical metrics directly into domain-constrained prompt templates to provide concise, "
        "actionable recommendations. Furthermore, bidirectional remote load control is implemented via a two-channel opto-isolated active-LOW relay "
        "module, enabling users to switch connected 230V AC loads remotely with physical closed-loop current verification provided by the PZEM sensors. "
        "Experimental bench testing demonstrates robust end-to-end telemetry delivery, sub-second actuation latency, precise tariff estimation, "
        "and practical load-shifting insights, providing a complete, low-cost smart home energy management solution.",
        space_after=6
    )

    doc.add_page_break()

    # Helper function for reference blackbook-style tables (List Of Contents, List of Figures, List of Tables)
    def add_reference_style_table(doc, title, headers, rows, col_widths):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(14)
        r = p.add_run(title)
        r.font.name = "Times New Roman"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0, 0, 0)

        table = doc.add_table(rows=len(rows)+1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER

        # Solid black borders on all cells
        tblPr = table._element.xpath('w:tblPr')[0]
        borders = parse_xml(f'<w:tblBorders {nsdecls("w")}><w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tblBorders>')
        tblPr.append(borders)

        # Header row
        for idx, h_text in enumerate(headers):
            cell = table.rows[0].cells[idx]
            cell.text = h_text
            tcPr = cell._element.get_or_add_tcPr()
            tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar>')
            tcPr.append(tcMar)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.0
            for run in p.runs:
                run.font.name = "Times New Roman"
                run.font.size = Pt(11)
                run.font.bold = True
                run.font.color.rgb = RGBColor(0, 0, 0)

        # Data rows
        for r_idx, row_data in enumerate(rows):
            sr_no, label, pg_no = row_data[0], row_data[1], row_data[2]
            is_bold = row_data[3] if len(row_data) > 3 else False

            row_cells = table.rows[r_idx+1].cells

            # Col 0: Sr. No.
            row_cells[0].text = str(sr_no)
            tcPr0 = row_cells[0]._element.get_or_add_tcPr()
            tcMar0 = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="40" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:left w:w="60" w:type="dxa"/><w:right w:w="60" w:type="dxa"/></w:tcMar>')
            tcPr0.append(tcMar0)
            p0 = row_cells[0].paragraphs[0]
            p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p0.paragraph_format.space_after = Pt(0)
            p0.paragraph_format.line_spacing = 1.0
            for run in p0.runs:
                run.font.name = "Times New Roman"
                run.font.size = Pt(10)
                run.font.bold = is_bold
                run.font.color.rgb = RGBColor(0, 0, 0)

            # Col 1: Contents
            row_cells[1].text = str(label)
            tcPr1 = row_cells[1]._element.get_or_add_tcPr()
            tcMar1 = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="40" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar>')
            tcPr1.append(tcMar1)
            p1 = row_cells[1].paragraphs[0]
            p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p1.paragraph_format.space_after = Pt(0)
            p1.paragraph_format.line_spacing = 1.0
            for run in p1.runs:
                run.font.name = "Times New Roman"
                run.font.size = Pt(10)
                run.font.bold = is_bold
                run.font.color.rgb = RGBColor(0, 0, 0)

            # Col 2: Pg. No.
            row_cells[2].text = str(pg_no)
            tcPr2 = row_cells[2]._element.get_or_add_tcPr()
            tcMar2 = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="40" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:left w:w="60" w:type="dxa"/><w:right w:w="60" w:type="dxa"/></w:tcMar>')
            tcPr2.append(tcMar2)
            p2 = row_cells[2].paragraphs[0]
            p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p2.paragraph_format.space_after = Pt(0)
            p2.paragraph_format.line_spacing = 1.0
            for run in p2.runs:
                run.font.name = "Times New Roman"
                run.font.size = Pt(10)
                run.font.bold = is_bold
                run.font.color.rgb = RGBColor(0, 0, 0)

        if col_widths:
            for row in table.rows:
                for idx, w in enumerate(col_widths):
                    row.cells[idx].width = Inches(w)

    # =========================================================================
    # 8. LIST OF CONTENTS (Exact Reference Table Format)
    # =========================================================================
    contents_data = [
        # Chapter 1
        ("1", "Introduction", "17-20", True),
        ("1.1", "Introduction", "17", False),
        ("1.2", "Background of the Project", "17", False),
        ("1.3", "Problem Statement", "18", False),
        ("1.4", "Motivation", "18", False),
        ("1.5", "Proposed System", "18", False),
        ("1.6", "Objectives", "19", False),
        ("1.7", "Scope of the Project", "19", False),
        ("1.8", "Applications", "19", False),
        ("1.9", "Organization of the Report", "20", False),
        # Chapter 2
        ("2", "Review of Literature", "21-26", True),
        ("2.1", "Introduction", "21", False),
        ("2.2", "Paper Reviews", "21", False),
        ("2.2.1", "Paper 1: Development of Energy Consumption Measurement & Monitoring System", "21", False),
        ("2.2.2", "Paper 2: Smart Energy Monitoring System Using ESP32 Microcontroller", "22", False),
        ("2.2.3", "Paper 3: IoT-Based Smart Home Energy Management System with Predictive Billing", "22", False),
        ("2.2.4", "Paper 4: Smart Residential Load Management and Time-of-Use Optimization", "23", False),
        ("2.2.5", "Paper 5: Non-Intrusive Load Monitoring and Energy Disaggregation on Edge Devices", "24", False),
        ("2.3", "Comparative Evaluation of Existing Systems", "24", False),
        ("2.4", "Research Gaps Identified", "25", False),
        ("2.5", "Summary", "26", False),
        # Chapter 3
        ("3", "System Study and Feasibility", "27-31", True),
        ("3.1", "Introduction", "27", False),
        ("3.2", "Feasibility Study", "27", False),
        ("3.2.1", "Technical Feasibility", "27", False),
        ("3.2.2", "Operational Feasibility", "27", False),
        ("3.2.3", "Economic Feasibility", "27", False),
        ("3.2.4", "Resource Feasibility", "28", False),
        ("3.3", "Functional Requirements", "28", False),
        ("3.4", "Non-Functional Requirements", "28", False),
        ("3.5", "Hardware Requirements", "29", False),
        ("3.6", "Software Requirements", "29", False),
        ("3.7", "Bill of Materials (BOM) & Budget Estimate", "30", False),
        ("3.8", "Limitations and Assumptions", "30", False),
        ("3.9", "Summary", "31", False),
        # Chapter 4
        ("4", "System Architecture and Hardware Components", "32-43", True),
        ("4.1", "Overall System Architecture", "32", False),
        ("4.2", "Hardware Components", "33", False),
        ("4.2.1", "ESP32 DevKit V1 Microcontroller Board", "33", False),
        ("4.2.2", "Peacefair PZEM-004T V3.0 Energy Monitoring Sensor", "35", False),
        ("4.2.3", "Two-Channel 5V Opto-Isolated Relay Module", "37", False),
        ("4.2.4", "Connected Electrical Loads & Test Bench Fixtures", "38", False),
        ("4.3", "Hardware Wiring & Interconnection Schematic", "39", False),
        ("4.4", "Sensor Communication & Modbus RTU Protocol", "41", False),
        ("4.5", "Firmware Execution Architecture", "41", False),
        ("4.6", "Backend Architecture (Node.js & Express)", "41", False),
        ("4.7", "Database Architecture (Neon PostgreSQL)", "41", False),
        ("4.8", "Frontend Architecture (React 18 & Recharts)", "42", False),
        ("4.9", "Communication Protocols (MQTT & WebSockets)", "42", False),
        ("4.10", "Electrical Safety & Mains Isolation Domains", "42", False),
        ("4.11", "Summary", "42", False),
        # Chapter 5
        ("5", "System Features and Functionality", "44-48", True),
        ("5.1", "Overview of Core System Capabilities", "44", False),
        ("5.2", "Real-Time Multi-Parameter Electrical Monitoring", "44", False),
        ("5.3", "Individual Load Monitoring & Disaggregation", "44", False),
        ("5.4", "Energy Consumption Tracking & Run-Rate Formulation", "44", False),
        ("5.5", "MERC LT-I (B) Slab Bill Estimation Engine", "45", False),
        ("5.5.1", "Telescopic Slab Mathematical Formulation", "45", False),
        ("5.5.2", "Worked Mathematical Example (250 kWh Monthly Consumption)", "45", False),
        ("5.6", "Bidirectional Relay Load Control & CT Verification", "46", False),
        ("5.7", "Real-Time Dashboard & Glassmorphism UI", "46", False),
        ("5.8", "Historical Analytics & Trend Visualization (Recharts)", "46", False),
        ("5.9", "Google Gemini AI Energy Conservation Advisor", "46", False),
        ("5.10", "Error Handling & Fault-Tolerant Resilience", "47", False),
        ("5.11", "Security, Authentication & Session Integrity", "47", False),
        ("5.12", "Implemented Versus Proposed Features Audit", "47", False),
        ("5.13", "Summary", "48", False),
        # Chapter 6
        ("6", "System Workflow and Use Case", "49-67", True),
        ("6.1", "Overall System Operational Workflow", "49", False),
        ("6.2", "Sensor-Reading Workflow", "51", False),
        ("6.3", "Data-Communication Architecture", "53", False),
        ("6.4", "Electricity-Bill Calculation Workflow", "55", False),
        ("6.5", "Bidirectional Relay Control & Actuation Workflow", "57", False),
        ("6.6", "Google Gemini AI Advisory Pipeline", "59", False),
        ("6.7", "System Use-Case Architecture", "61", False),
        ("6.8", "Data-Flow Architecture", "62", False),
        ("6.8.1", "Level 0 Context Data Flow Architecture", "62", False),
        ("6.8.2", "Level 1 Functional Data Flow Decomposition", "62", False),
        ("6.9", "System Sequence Interaction Analysis", "63", False),
        ("6.10", "Project Implementation Gantt Chart & Milestone Schedule", "65", False),
        ("6.11", "Summary", "66", False),
        # Chapter 7
        ("7", "Implementation", "68-108", True),
        ("7.1", "Introduction", "68", False),
        ("7.2", "Development Environment & Toolchain", "68", False),
        ("7.2.1", "Arduino IDE & Embedded C++ Toolchain", "68", False),
        ("7.2.2", "Node.js & Express Server Runtime Environment", "68", False),
        ("7.2.3", "React.js Component-Based Web Framework", "69", False),
        ("7.2.4", "Tailwind CSS Utility-First Styling Framework", "69", False),
        ("7.3", "User Interface Screenshots", "70", False),
        ("7.4", "Cloud Database Tables & Telemetry Records", "73", False),
        ("7.5", "Embedded Hardware & Firmware Code", "74", False),
        ("7.5.1", "firmware/EnerSense/EnerSense.ino:", "73", False),
        ("7.5.2", "firmware/PzemSetAddress/PzemSetAddress.ino:", "76", False),
        ("7.5.3", "firmware/RelayTest/RelayTest.ino:", "77", False),
        ("7.5.4", "firmware/BasicTest/BasicTest.ino:", "78", False),
        ("7.6", "Backend & Cloud Database Code", "79", False),
        ("7.6.1", "backend/server.js:", "79", False),
        ("7.6.2", "backend/db.js:", "84", False),
        ("7.7", "Frontend Web Application Code", "86", False),
        ("7.7.1", "src/context/MqttContext.jsx:", "85", False),
        ("7.7.2", "src/utils/billing.js:", "87", False),
        ("7.7.3", "src/utils/gemini.js:", "91", False),
        ("7.7.4", "src/pages/DashboardPage.jsx:", "92", False),
        ("7.7.5", "src/pages/AppliancesPage.jsx:", "101", False),
        ("7.7.6", "src/pages/EnergyGraphsPage.jsx:", "104", False),
        ("7.7.7", "src/App.jsx:", "106", False),
        ("7.8", "Hardware-Software Integration Pipeline", "107", False),
        ("7.9", "Summary", "109", False),
        # Chapter 8
        ("8", "Testing, Results, and Conclusion", "109-116", True),
        ("8.1", "Introduction & Testing Strategy", "109", False),
        ("8.2", "Comprehensive Subsystem Test Cases", "109", False),
        ("8.2.1", "Hardware and Sensor Test Cases", "109", False),
        ("8.2.2", "Relay and Communication Test Cases", "110", False),
        ("8.2.3", "Backend and Database Test Cases", "110", False),
        ("8.2.4", "Frontend User Interface Test Cases", "111", False),
        ("8.2.5", "MERC Tariff Bill Calculation Test Cases", "112", False),
        ("8.2.6", "Google Gemini AI Recommendation Test Cases", "113", False),
        ("8.2.7", "Fluke Calibration Benchmark Test Cases", "113", False),
        ("8.2.8", "Comprehensive System Test Case Execution Matrix", "114", False),
        ("8.3", "Experimental Results & Discussion", "115", False),
        ("8.4", "System Limitations", "115", False),
        ("8.5", "Future Scope & Extensions", "115", False),
        ("8.6", "Conclusion", "116", False),
        ("", "References", "101", True),
    ]
    add_reference_style_table(doc, "List Of Contents", ["Sr.\nNo.", "Contents", "Pg.\nNo."], contents_data, [0.85, 4.85, 0.8])

    doc.add_page_break()

    # =========================================================================
    # 9. LIST OF FIGURES & TABLES (Reference Table Format)
    # =========================================================================
    figures_data = [
        ("Figure 4.1.1", "Overall System Block Diagram of Home Energy Optimizer", "32"),
        ("Figure 4.2.1", "ESP32 DevKit V1 30-Pin Dual-Core Microcontroller Board", "33"),
        ("Figure 4.2.2", "Peacefair PZEM-004T V3.0 AC Energy Sensor Module with CT Coil", "35"),
        ("Figure 4.2.3", "Two-Channel 5V Opto-Isolated Relay Breakout Module", "37"),
        ("Figure 4.2.4a", "Demonstration Resistive and Energy-Efficient Lamp Loads", "38"),
        ("Figure 4.2.4b", "Insulated Batten Lamp Baseholders for 230V AC Mains Wiring", "38"),
        ("Figure 4.3.1", "Comprehensive Hardware Wiring & Interconnection Schematic", "39"),
        ("Figure 6.1.1", "Overall System Operational Workflow Flowchart", "49"),
        ("Figure 6.2.1", "Dual PZEM-004T Sensor Acquisition & Reading Flowchart", "51"),
        ("Figure 6.3.1", "Multi-Tier Data Communication Architecture & Protocol Flowchart", "53"),
        ("Figure 6.4.1", "Electricity Bill Estimation & MERC LT-1 B Tariff Flowchart", "55"),
        ("Figure 6.5.1", "Bidirectional Relay Control & Actuation Flowchart", "57"),
        ("Figure 6.6.1", "Google Gemini AI Advisory Pipeline Flowchart", "59"),
        ("Figure 6.7.1", "UML Use Case Architecture Diagram", "61"),
        ("Figure 6.8.1a", "Context Data Flow Diagram (DFD Level 0)", "62"),
        ("Figure 6.8.1b", "Functional Data Flow Diagram (DFD Level 1)", "62"),
        ("Figure 6.9.1", "System Sequence Interaction Diagram", "63"),
        ("Figure 6.10.1", "Project Implementation Gantt Chart (12-Week Schedule)", "65"),
        ("Figure 7.2.1", "Arduino IDE & Embedded Toolchain", "68"),
        ("Figure 7.2.2", "Node.js & Express Server Runtime Environment", "68"),
        ("Figure 7.2.3", "React.js Component-Based Web Framework", "69"),
        ("Figure 7.2.4", "Tailwind CSS Utility-First Styling Framework", "69"),
        ("Figure 7.3.1", "EnerSense Landing & Welcome Page", "70"),
        ("Figure 7.3.2", "User Authentication & Registration Interface", "71"),
        ("Figure 7.3.3", "Real-Time Glassmorphism Monitoring Dashboard", "71"),
        ("Figure 7.3.4", "Monthly Bill Forecast & MERC Tariff Breakdown Modal", "72"),
        ("Figure 7.3.5", "Appliance Remote Switching & Control Panel", "72"),
        ("Figure 7.3.6", "User Profile, Energy Persona & Conservation Tips View", "73"),
        ("Figure 7.4.1", "PostgreSQL 'users' Authentication Table Records", "74"),
        ("Figure 7.4.2", "PostgreSQL 'energy_readings' Historical Telemetry Logs", "74"),
    ]
    add_reference_style_table(doc, "List of Figures", ["Sr.\nNo.", "Figures", "Pg.\nNo."], figures_data, [0.95, 4.75, 0.8])

    doc.add_page_break()

    tables_data = [
        ("Table 2.2.1", "Literature Review: Zaidi et al. (2024)", "21"),
        ("Table 2.2.2", "Literature Review: El-Khozondar et al. (2024)", "22"),
        ("Table 2.2.3", "Literature Review: Sundararaman et al. (2020)", "22"),
        ("Table 2.2.4", "Literature Review: Gonçalves et al. (2025)", "23"),
        ("Table 2.2.5", "Literature Review: Farrag et al. (2025)", "24"),
        ("Table 2.3.1", "Summary Comparison of Reviewed Work vs. Proposed EnerSense System", "24"),
        ("Table 3.5.1", "Hardware Requirements and Technical Specifications", "29"),
        ("Table 3.6.1", "Software Requirements and Development Frameworks", "29"),
        ("Table 3.7.1", "Itemized Bill of Materials (BOM) & Prototype Budget", "30"),
        ("Table 4.2.1", "ESP32 DevKit V1 Physical Pinout and Hardware Connection Table", "34"),
        ("Table 4.2.2", "PZEM-004T V3.0 Modbus RTU Register Specification", "36"),
        ("Table 5.5.1", "Approved MERC FY 2024-25 Category LT-I (B) Residential Tariff Slabs", "45"),
        ("Table 5.12.1", "Implementation Feature Audit Matrix", "47"),
        ("Table 6.10.1", "Proposed Project Schedule (15 Development Phases Across 12 Weeks)", "66"),
        ("Table 8.2.1", "Hardware and Sensor Test Cases (SN-01 to SN-06)", "109"),
        ("Table 8.2.2", "Relay and Communication Test Cases (RL-01 to RL-03, MQ-01 to MQ-03)", "110"),
        ("Table 8.2.3", "Backend and Database Test Cases (AP-01 to AP-04, DB-01 to DB-03)", "110"),
        ("Table 8.2.4", "Frontend User Interface Test Cases (FE-01 to FE-07)", "111"),
        ("Table 8.2.5", "MERC Tariff Bill Calculation Test Cases (BL-01 to BL-10)", "112"),
        ("Table 8.2.6", "Google Gemini AI Recommendation Test Cases (AI-01 to AI-03)", "113"),
        ("Table 8.2.7", "Fluke Calibration Benchmark Test Cases (FL-01 to FL-04)", "113"),
        ("Table 8.2.8", "Comprehensive System Test Case Execution Matrix (SY-01 to SY-05)", "114"),
    ]
    add_reference_style_table(doc, "List of Tables", ["Sr.\nNo.", "Table", "Pg.\nNo."], tables_data, [1.05, 4.65, 0.8])
    doc.add_page_break()

    # 10. LIST OF ABBREVIATIONS
    builder.add_chapter_title("LIST OF ABBREVIATIONS")
    abbrs = [
        ("AC", "Alternating Current"),
        ("ADC", "Analog-to-Digital Converter"),
        ("AI", "Artificial Intelligence"),
        ("API", "Application Programming Interface"),
        ("BOM", "Bill of Materials"),
        ("CEA", "Central Electricity Authority"),
        ("COM", "Common (Relay Terminal)"),
        ("CPU", "Central Processing Unit"),
        ("CRC", "Cyclic Redundancy Check"),
        ("CT", "Current Transformer"),
        ("DC", "Direct Current"),
        ("DHCP", "Dynamic Host Configuration Protocol"),
        ("EC", "Energy Charge"),
        ("EMF", "Electromotive Force"),
        ("EMI", "Electromagnetic Interference"),
        ("ESP32", "Espressif Systems 32-bit Microcontroller"),
        ("FAC", "Fuel Adjustment Cost"),
        ("FC", "Fixed Demand Charge"),
        ("FIFO", "First In First Out"),
        ("GPIO", "General Purpose Input Output"),
        ("HTTP", "Hypertext Transfer Protocol"),
        ("HTTPS", "Hypertext Transfer Protocol Secure"),
        ("IoT", "Internet of Things"),
        ("IP", "Internet Protocol"),
        ("JSON", "JavaScript Object Notation"),
        ("JWT", "JSON Web Token"),
        ("LED", "Light Emitting Diode"),
        ("MCU", "Microcontroller Unit"),
        ("MERC", "Maharashtra Electricity Regulatory Commission"),
        ("MQTT", "Message Queuing Telemetry Transport"),
        ("MSEDCL", "Maharashtra State Electricity Distribution Co. Ltd."),
        ("NO", "Normally Open (Relay Terminal)"),
        ("OLED", "Organic Light Emitting Diode"),
        ("OTP", "One Time Password"),
        ("PC817", "Optocoupler / Photocoupler IC"),
        ("PEO", "Program Educational Objective"),
        ("PF", "Power Factor"),
        ("PO", "Program Outcome"),
        ("PSO", "Program Specific Outcome"),
        ("PZEM", "Peacefair Energy Monitor Module"),
        ("QoS", "Quality of Service"),
        ("RAM", "Random Access Memory"),
        ("REST", "Representational State Transfer"),
        ("RTU", "Remote Terminal Unit (Modbus)"),
        ("RX", "Receive Serial Line"),
        ("SBMP", "Shri Bhagubhai Mafatlal Polytechnic"),
        ("SDK", "Software Development Kit"),
        ("SPI", "Serial Peripheral Interface"),
        ("SQL", "Structured Query Language"),
        ("SSID", "Service Set Identifier (Wi-Fi Name)"),
        ("TCP", "Transmission Control Protocol"),
        ("TOD", "Time of Day"),
        ("TX", "Transmit Serial Line"),
        ("UART", "Universal Asynchronous Receiver-Transmitter"),
        ("UI", "User Interface"),
        ("UML", "Unified Modeling Language"),
        ("URI", "Uniform Resource Identifier"),
        ("USB", "Universal Serial Bus"),
        ("Vite", "Frontend Build Tool & Dev Server"),
        ("WPA2", "Wi-Fi Protected Access II"),
        ("WS", "WebSockets")
    ]
    for ab, desc in abbrs:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        r_ab = p.add_run(f"{ab:12s}")
        r_ab.bold = True
        r_ab.font.name = "Consolas"
        r_ab.font.size = Pt(9.5)
        r_d = p.add_run(f":  {desc}")
        r_d.font.size = Pt(9.5)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    builder.add_chapter_title("CHAPTER 1: INTRODUCTION")
    
    builder.add_heading_1("1.1 Introduction")
    builder.add_p(
        "Electrical energy is the lifeblood of modern society, underpinning residential convenience, industrial productivity, "
        "and digital connectivity. However, the relentless expansion of domestic electrical appliances—ranging from continuous-load "
        "refrigeration and ambient air conditioning systems to smart entertainment centers and high-capacity culinary devices—has "
        "drastically augmented household electricity consumption. Despite rapid technological evolution across consumer electronics, "
        "the infrastructure governing residential electricity monitoring has remained fundamentally static. Traditional electromechanical "
        "and basic electronic utility meters function purely as retrospective accounting tools: they register cumulative kilowatt-hour (kWh) "
        "consumption over a monthly billing cycle, providing zero real-time feedback to occupants regarding instantaneous power spikes, "
        "appliance-level consumption disparities, or impending tariff escalation. Consequently, residential consumers frequently suffer "
        "severe 'bill shock' upon receipt of monthly utility invoices, with virtually no actionable data to diagnose or curtail excessive consumption.\n\n"
        "Recent advancements in edge computing microcontrollers, non-invasive electrical parameter sensing, and Internet of Things (IoT) "
        "communication architectures have opened unprecedented avenues for high-resolution residential energy management. The 'Home Energy Optimizer' "
        "(EnerSense) project addresses this critical technological gap by architecting a production-grade, highly responsive, end-to-end "
        "energy telemetry, predictive tariff calculation, and load-switching platform designed specifically for residential single-phase "
        "installations under Indian utility distribution norms."
    )

    builder.add_heading_1("1.2 Background of the Project")
    builder.add_p(
        "Residential electricity consumption in metropolitan urban centers accounts for over thirty percent of total grid demand. "
        "In developing nations such as India, state electricity regulatory commissions implement progressive, non-linear 'telescopic' tariff structures "
        "to subsidize lifeline consumption while penalizing excessive usage. Under the Maharashtra Electricity Regulatory Commission (MERC) "
        "tariff framework, energy consumption is partitioned into distinct tiers (0-100 units, 101-300 units, 301-500 units, and >500 units), "
        "where the effective rate per unit escalates aggressively as households cross into higher slabs. In addition to telescopic energy charges, "
        "bills include tiered fixed demand charges, wheeling charges per unit, fuel adjustment costs (FAC), time-of-day (TOD) surcharges/rebates, "
        "and statutory state electricity duties.\n\n"
        "Under this multi-tiered regulatory framework, even modest unmonitored baseline consumption—such as an aging refrigerator compressor cycling "
        "inefficiently, continuous standby 'phantom loads,' or an unmanaged water heater—can inadvertently push a household into higher tariff tiers, "
        "substantially magnifying the aggregate monthly billing burden. Without granular, real-time sensing and instant feedback, occupants cannot "
        "correlate their daily lifestyle habits with real economic consequences."
    )

    builder.add_heading_1("1.3 Problem Statement")
    builder.add_p(
        "Conventional residential utility meters fail to provide consumers with real-time, actionable visibility into electrical parameters, "
        "appliance-specific consumption, and progressive tariff slab risks. Existing commercial smart plugs and home automation monitors are "
        "predominantly proprietary, expensive, isolated from local regulatory tariff calculations, and lack intelligent contextual guidance. "
        "Therefore, there exists a pressing engineering need for an open, affordable, and comprehensive IoT energy monitoring and optimization system "
        "that accurately measures multi-point electrical parameters, calculates predictive utility bills based on authentic regulatory tariff structures, "
        "enables bidirectional safety-rated load control, and delivers generative AI-driven conservation recommendations directly to the consumer."
    )

    builder.add_heading_1("1.4 Motivation")
    builder.add_p(
        "The motivation behind the development of EnerSense stems from three converging drivers:\n\n"
        "1. Consumer Economic Empowerment: Providing households with real-time rupee-denominated billing projections so they can actively prevent "
        "costly slab transitions before the monthly meter reading occurs.\n"
        "2. Technological Innovation at the Edge: Interfacing low-cost industrial-grade AC energy monitoring sensors (PZEM-004T V3.0) with high-speed "
        "dual-core microcontrollers (ESP32 DevKit V1) via isolated Modbus RTU serial links to achieve utility-grade sub-percent accuracy.\n"
        "3. Integration of Applied Artificial Intelligence: Bridging the gap between raw sensor telemetry and everyday consumer actions by embedding "
        "the Google Gemini generative AI API, converting dry electrical numbers into personalized, context-aware energy-saving strategies."
    )

    builder.add_heading_1("1.5 Proposed System")
    builder.add_p(
        "The proposed EnerSense system is an integrated hardware-software IoT platform structured across four functional tiers:\n\n"
        "• Edge Sensing Layer: Dual Peacefair PZEM-004T V3.0 modules equipped with external current transformers (CT) measure single-phase AC "
        "mains voltage, current, active power, energy, frequency, and power factor across separate appliance branches.\n"
        "• Edge Processing & Actuation Layer: An ESP32 DevKit V1 controller polls both sensors via separate hardware serial ports (UART1 and UART2) "
        "at 9600 baud using Modbus RTU protocol, validates packet CRC, serializes data into structured JSON, and drives a 2-channel opto-isolated "
        "relay module with active-LOW logic for load switching.\n"
        "• Cloud Communication Layer: The ESP32 connects to local 2.4 GHz Wi-Fi and publishes telemetry every 5 seconds to a public HiveMQ MQTT broker "
        "over TCP port 1883. An MQTT-over-WebSockets bridge on port 8000 enables direct bi-directional streaming with web clients.\n"
        "• Cloud Application & AI Layer: A modern React 18 single-page application features a dark glassmorphism dashboard, real-time Recharts visualizations, "
        "an authentic MERC LT-I (B) tariff estimation engine, and an interactive conversational assistant powered by Google Gemini 1.5 Flash."
    )

    builder.add_heading_1("1.6 Objectives")
    builder.add_bullet("To design and fabricate an open-architecture dual-channel AC energy monitoring test bench interfacing an ESP32 microcontroller with dual PZEM-004T V3.0 AC energy sensors.", "Objective 1: ")
    builder.add_bullet("To implement robust embedded C++ firmware executing deterministic Modbus RTU polling, CRC-16 frame validation, and parameter extraction.", "Objective 2: ")
    builder.add_bullet("To establish a reliable, low-latency cloud communication pipeline utilizing MQTT protocol over TCP and native WebSockets.", "Objective 3: ")
    builder.add_bullet("To develop a responsive, glassmorphism web dashboard utilizing React 18, Tailwind CSS, and Recharts for live parameter visualization.", "Objective 4: ")
    builder.add_bullet("To mathematically model and implement the official MERC FY 2024-25 Category LT-I (B) residential electricity tariff engine.", "Objective 5: ")
    builder.add_bullet("To integrate the Google Gemini Generative AI API (`gemini-3.5-flash`) for real-time, context-aware energy conservation recommendations.", "Objective 6: ")
    builder.add_bullet("To implement bidirectional remote load switching via opto-isolated relays with closed-loop physical confirmation via current sensing.", "Objective 7: ")
    builder.add_bullet("To construct a secure Node.js Express backend backed by a PostgreSQL database on Neon Serverless Cloud for user account management.", "Objective 8: ")

    builder.add_heading_1("1.7 Scope of the Project")
    builder.add_p(
        "The scope of this project encompasses the design, hardware assembly, embedded firmware programming, cloud protocol deployment, algorithmic modeling, "
        "and full-stack software development of a working prototype capable of monitoring two distinct 230V AC electrical load branches (up to 10A each). "
        "The prototype is validated in a controlled bench testing environment using authentic resistive and reactive household loads (incandescent lamps, "
        "smart entertainment systems, and heating elements). The tariff engine specifically models the regulatory tariff rules of the Maharashtra Electricity "
        "Regulatory Commission (MERC), but is architected modularly to permit adaptation to other state electricity distribution utilities."
    )

    builder.add_heading_1("1.8 Applications")
    builder.add_bullet("Smart Residential Homes: Enabling homeowners to track instantaneous power draw, prevent slab-crossing bill shock, and automate appliance schedules.", "• ")
    builder.add_bullet("Multi-Tenant Rental Properties & Shared Apartments: Providing transparent, granular energy sub-metering for individual tenant appliances.", "• ")
    builder.add_bullet("Commercial Offices & Educational Laboratories: Monitoring high-power workstations, lighting banks, and HVAC zones to curtail phantom power waste.", "• ")
    builder.add_bullet("Industrial & Commercial Energy Audits: Serving as an agile, portable telemetry logging tool for field engineers assessing electrical power factor.", "• ")

    builder.add_heading_1("1.9 Organization of the Report")
    builder.add_p(
        "This project report is organized systematically into eight comprehensive chapters:\n\n"
        "• Chapter 1: Introduction - Lays out the project background, problem statement, motivation, proposed architecture, objectives, and scope.\n"
        "• Chapter 2: Review of Literature - Analyzes academic literature, commercial systems, smart sensors, and establishes the research gap.\n"
        "• Chapter 3: System Study and Feasibility - Evaluates existing systems, functional/non-functional requirements, and technical/economic feasibility.\n"
        "• Chapter 4: System Architecture and Hardware Components - Detailed engineering exposition of the ESP32, PZEM-004T, relay module, and wiring.\n"
        "• Chapter 5: System Features and Functionality - In-depth analysis of energy measurement, MERC tariff math, AI advice, and feature classification.\n"
        "• Chapter 6: System Workflow and Use Case - Features all eight system diagrams (Flowcharts, Use Case, Gantt Chart) with complete explanations.\n"
        "• Chapter 7: Implementation - Documents development environments, firmware algorithms, React components, screenshots, and complete source code.\n"
        "• Chapter 8: Testing, Results, and Conclusion - Details testing strategies, unit/integration tests, 7-column test case matrices, limitations, and future scope.\n"
        "• References: Complete academic citations in IEEE standard format."
    )

    doc.add_page_break()

    # Save initial progress
    builder.save()
    print("Front Matter and Chapter 1 generated successfully.")

if __name__ == "__main__":
    build_blackbook()
