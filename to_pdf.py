#!/usr/bin/env python3
"""Convert ORARI implementation plan HTML to PDF using available tools."""
import os, subprocess, sys

HOME = os.path.expanduser('~')
html_file = os.path.join(HOME, 'Documents/Projek Hermes/ORARI_Aceh_Besar_Plan.html')
pdf_file = os.path.join(HOME, 'Documents/Projek Hermes/ORARI_Aceh_Besar_Plan.pdf')

if not os.path.exists(html_file):
    print(f'HTML file not found: {html_file}')
    sys.exit(1)

# Try wkhtmltopdf
wk = subprocess.run(['which', 'wkhtmltopdf'], capture_output=True, text=True)
if wk.returncode == 0:
    r = subprocess.run(['wkhtmltopdf', '--enable-local-file-access', html_file, pdf_file])
    if r.returncode == 0:
        print(f'✅ PDF created: {pdf_file}')
        sys.exit(0)

# Try weasyprint
try:
    from weasyprint import HTML
    HTML(filename=html_file).write_pdf(pdf_file)
    print(f'✅ PDF created (weasyprint): {pdf_file}')
    sys.exit(0)
except ImportError:
    pass

# Try pdfkit
try:
    import pdfkit
    pdfkit.from_file(html_file, pdf_file)
    print(f'✅ PDF created (pdfkit): {pdf_file}')
    sys.exit(0)
except ImportError:
    pass

print('No PDF converter available.')
print(f'Open {html_file} in browser, Cmd+P -> Save as PDF')
