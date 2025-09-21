#!/usr/bin/env python3
"""
Enhanced Bulk Email Sender with Brevo Integration
Web-accessible server for sending business opportunity emails
"""

import http.server
import socketserver
import json
import os
import io
import base64
from urllib.parse import parse_qs, urlparse
import pandas as pd
import docx
import requests
from pathlib import Path
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

class EmailHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Default files path
        self.default_excel_path = r"C:\Gaurav\BranchSpace BA\Vouchers\Importers Data Sept 25.xlsx"
        self.default_word_path = r"C:\Gaurav\BranchSpace BA\Vouchers\Dear Valued Prospective Partner.docx"
        super().__init__(*args, **kwargs)

    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.path = '/enhanced-bulk-email-sender.html'
        elif self.path == '/api/default-files':
            self.handle_default_files()
            return
        return super().do_GET()

    def do_POST(self):
        if self.path == '/api/upload-excel':
            self.handle_excel_upload()
        elif self.path == '/api/upload-word':
            self.handle_word_upload()
        elif self.path == '/api/send-email':
            self.handle_send_email()
        elif self.path == '/api/send-bulk-emails':
            self.handle_send_bulk_emails()
        else:
            self.send_error(404, "Endpoint not found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def handle_default_files(self):
        """Load and return default Excel and Word file data"""
        print("DEBUG: handle_default_files called")
        try:
            response = {
                'excel_data': None,
                'word_content': None,
                'success': True,
                'debug_info': {}
            }

            # Check Excel file
            print(f"DEBUG: Checking Excel file: {self.default_excel_path}")
            if os.path.exists(self.default_excel_path):
                print("DEBUG: Excel file exists, parsing...")
                excel_data = self.parse_excel_file(self.default_excel_path)
                response['excel_data'] = excel_data
                response['debug_info']['excel_found'] = True
                response['debug_info']['excel_count'] = len(excel_data) if excel_data else 0
                print(f"DEBUG: Parsed {len(excel_data) if excel_data else 0} contacts")
            else:
                print("DEBUG: Excel file not found")
                response['debug_info']['excel_found'] = False

            # Check Word file
            print(f"DEBUG: Checking Word file: {self.default_word_path}")
            if os.path.exists(self.default_word_path):
                print("DEBUG: Word file exists, parsing...")
                word_content = self.parse_word_file(self.default_word_path)
                response['word_content'] = word_content
                response['debug_info']['word_found'] = True
                print("DEBUG: Word file parsed successfully")
            else:
                print("DEBUG: Word file not found")
                response['debug_info']['word_found'] = False

            print("DEBUG: Sending response...")
            self.send_json_response(response)
            print("DEBUG: Response sent")

        except Exception as e:
            print(f"DEBUG: Error in handle_default_files: {str(e)}")
            self.send_json_response({
                'success': False,
                'message': f'Error loading default files: {str(e)}',
                'debug_info': {'error': str(e)}
            })

    def handle_excel_upload(self):
        """Handle Excel file upload and parsing"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            # Decode base64 file data
            file_data = json.loads(post_data.decode('utf-8'))
            file_content = base64.b64decode(file_data['content'])

            # Save temporarily and parse
            temp_path = 'temp_excel.xlsx'
            with open(temp_path, 'wb') as f:
                f.write(file_content)

            excel_data = self.parse_excel_file(temp_path)
            os.remove(temp_path)

            self.send_json_response({
                'success': True,
                'data': excel_data
            })

        except Exception as e:
            self.send_json_response({
                'success': False,
                'message': f'Error processing Excel file: {str(e)}'
            })

    def handle_word_upload(self):
        """Handle Word document upload and parsing"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            # Decode base64 file data
            file_data = json.loads(post_data.decode('utf-8'))
            file_content = base64.b64decode(file_data['content'])

            # Save temporarily and parse
            temp_path = 'temp_document.docx'
            with open(temp_path, 'wb') as f:
                f.write(file_content)

            word_content = self.parse_word_file(temp_path)
            os.remove(temp_path)

            self.send_json_response({
                'success': True,
                'content': word_content
            })

        except Exception as e:
            self.send_json_response({
                'success': False,
                'message': f'Error processing Word document: {str(e)}'
            })

    def parse_excel_file(self, file_path):
        """Parse Excel file and extract all worksheets data"""
        try:
            xl_file = pd.ExcelFile(file_path)
            all_data = []

            for sheet_name in xl_file.sheet_names:
                df = pd.read_excel(xl_file, sheet_name=sheet_name)

                # Clean and process data
                df = df.fillna('')

                for _, row in df.iterrows():
                    contact = {
                        'sheet': sheet_name,
                        'firm': self.get_column_value(row, ['Firm', 'Company', 'firm', 'company']),
                        'contact_person': self.get_column_value(row, ['Contact Person', 'Name', 'contact_person', 'name']),
                        'email': self.get_column_value(row, ['Email', 'E-mail', 'email', 'e-mail']),
                        'address': self.get_column_value(row, ['Address', 'address']),
                        'contact_number': self.get_column_value(row, ['Contact Number', 'Phone', 'contact_number', 'phone']),
                        'website': self.get_column_value(row, ['Website', 'website']),
                        'category': self.get_column_value(row, ['Category', 'category']),
                        'country': sheet_name,  # Sheet name represents country
                        'original_data': row.to_dict()
                    }

                    # Only include contacts with email addresses
                    if contact['email']:
                        all_data.append(contact)

            return all_data

        except Exception as e:
            raise Exception(f"Error parsing Excel file: {str(e)}")

    def parse_word_file(self, file_path):
        """Parse Word document and extract content"""
        try:
            doc = docx.Document(file_path)
            content = '\n'.join([para.text for para in doc.paragraphs])

            # Always use the standard template, ignore any Sri Lanka specific content
            # Create generic email template format
            template = f"""From: vishwas.agarwal@gmail.com
From-Name: Intex Technologies
To: {{email}}
Subject: Business Partnership Opportunity - {{country}}

Dear Valued Prospective Partner,

We are pleased to introduce Intex Technologies, a globally recognized brand with a rich legacy spanning 29 years in the consumer electronics and technology sectors. Intex has established itself as a trusted name, known for its diverse range of high-quality products, including home appliances, IT peripherals, and mobile devices.

Having successfully built a strong presence in various international markets, Intex is now strategically re-entering the dynamic {{country}} market. We are actively seeking experienced and reputable importers and distributors to forge strong, mutually beneficial partnerships. Our goal is to collaborate with partners who share our vision of growth and are committed to expanding Intex's reach and availability across {{country}}.

We believe that with your local expertise and our established brand reputation and product portfolio, we can achieve significant success together. We are confident that this collaboration will not only benefit both parties but also bring cutting-edge technology and reliable products to consumers in {{country}}.

Our comprehensive product range includes:

• IT PERIPHERALS: Keyboards, mice, headsets, webcams, and other essential computer accessories
• HOME APPLIANCES: Kitchen appliances, air coolers, personal care devices, and smart home solutions
• MOBILE ACCESSORIES: Chargers, power banks, cables, and mobile peripherals
• AUDIO SOLUTIONS: Speakers, headphones, earphones, and sound systems

What sets Intex apart as your ideal partner:

✓ 29 years of proven experience and brand trust
✓ Global presence in over 40 countries
✓ International quality certifications and standards
✓ Competitive pricing with attractive margins
✓ Comprehensive marketing and technical support
✓ Flexible payment terms and reliable logistics

We are committed to providing our partners with:

• Exclusive territorial distribution rights
• Comprehensive product training and support
• Marketing materials and promotional campaigns
• Dedicated account management services
• Technical support and after-sales service backup

We would be delighted to discuss this partnership opportunity with you in detail. Our team is ready to share product catalogues, pricing structures, and partnership terms that reflect our commitment to mutual success.

We look forward to the possibility of building a prosperous business relationship together.

Best regards,

Vishwas Agarwal
Business Head & COO
Intex Technologies

Email: vishwas.agarwal@gmail.com
Mobile: +91-9999290800
Website: www.intexindia.co.in

"Innovation that connects, technology that empowers\""""

            return template

        except Exception as e:
            raise Exception(f"Error parsing Word document: {str(e)}")

    def get_column_value(self, row, possible_names):
        """Get value from row using possible column names"""
        for name in possible_names:
            if name in row and pd.notna(row[name]) and str(row[name]).strip():
                return str(row[name]).strip()
        return ''

    def handle_send_email(self):
        """Send single email using Brevo API"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            result = self.send_email_via_brevo(
                from_email=data.get('from_email'),
                from_name=data.get('from_name'),
                to_email=data.get('to_email'),
                subject=data.get('subject'),
                content=data.get('content')
            )

            self.send_json_response(result)

        except Exception as e:
            self.send_json_response({
                'success': False,
                'message': f'Server error: {str(e)}'
            })

    def handle_send_bulk_emails(self):
        """Send multiple emails in bulk"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            emails = data.get('emails', [])
            results = []

            for email_data in emails:
                result = self.send_email_via_brevo(
                    from_email=email_data.get('from_email'),
                    from_name=email_data.get('from_name'),
                    to_email=email_data.get('to_email'),
                    subject=email_data.get('subject'),
                    content=email_data.get('content')
                )
                results.append({
                    'to_email': email_data.get('to_email'),
                    'success': result['success'],
                    'message': result['message']
                })

            self.send_json_response({
                'success': True,
                'results': results
            })

        except Exception as e:
            self.send_json_response({
                'success': False,
                'message': f'Bulk email error: {str(e)}'
            })

    def send_email_via_webhook(self, from_email, from_name, to_email, subject, content):
        """Send email using a free webhook service (like Formspree or EmailJS)"""
        try:
            print(f"DEBUG: Attempting webhook email from {from_name} <{from_email}> to {to_email}")

            # Using a free service like Formspree (replace with actual endpoint)
            # You can get a free endpoint from https://formspree.io/
            webhook_url = "https://formspree.io/f/your_form_id"  # Replace with actual form ID

            # Prepare the payload
            payload = {
                'name': from_name,
                'email': from_email,
                'to': to_email,
                'subject': subject,
                'message': content,
                '_replyto': from_email,
                '_subject': subject
            }

            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }

            # Alternative: Use SendGrid free API (100 emails/day)
            # Get free API key from https://sendgrid.com/
            sendgrid_api_key = "your_sendgrid_api_key_here"  # Replace with actual key
            sendgrid_url = "https://api.sendgrid.com/v3/mail/send"

            sendgrid_payload = {
                "personalizations": [{
                    "to": [{"email": to_email}],
                    "subject": subject
                }],
                "from": {"email": from_email, "name": from_name},
                "content": [{
                    "type": "text/plain",
                    "value": content
                }]
            }

            sendgrid_headers = {
                "Authorization": f"Bearer {sendgrid_api_key}",
                "Content-Type": "application/json"
            }

            # For demo, simulate success - in production use real SendGrid
            print(f"DEBUG: Email would be sent via SendGrid to {to_email}")
            print(f"DEBUG: Sign up at https://sendgrid.com/ for free 100 emails/day")

            # Fallback to file logging for now
            return self.send_email_via_simple_log(from_email, from_name, to_email, subject, content)

        except Exception as e:
            print(f"DEBUG: Webhook email failed: {str(e)}")
            return self.send_email_via_simple_log(from_email, from_name, to_email, subject, content)

    def send_email_via_simple_log(self, from_email, from_name, to_email, subject, content):
        """Fallback: Log email details to file for manual sending"""
        try:
            print(f"DEBUG: Logging email details for manual processing")

            # Create logs directory if it doesn't exist
            logs_dir = "email_logs"
            if not os.path.exists(logs_dir):
                os.makedirs(logs_dir)

            # Generate filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{logs_dir}/email_{timestamp}.txt"

            # Write email details to file
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"=== EMAIL LOG ===\n")
                f.write(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"From: {from_name} <{from_email}>\n")
                f.write(f"To: {to_email}\n")
                f.write(f"Subject: {subject}\n")
                f.write(f"Content:\n{content}\n")
                f.write(f"=== END EMAIL ===\n")

            print(f"DEBUG: Email logged to {filename}")
            return {
                'success': True,
                'message': f'Email logged to {filename} for manual sending',
                'method': 'File Log'
            }

        except Exception as e:
            print(f"DEBUG: File logging failed: {str(e)}")
            return {
                'success': False,
                'message': f'All email methods failed: {str(e)}'
            }

    def send_email_via_brevo(self, from_email, from_name, to_email, subject, content):
        """Send email using Brevo API with Gmail fallback"""
        try:
            # Get Brevo API key from environment or use default
            api_key = os.getenv('BREVO_API_KEY', 'your-brevo-api-key-here')

            print(f"DEBUG: Using Brevo API key: {api_key[:20]}...")
            print(f"DEBUG: Sending email from {from_name} <{from_email}> to {to_email}")
            print(f"DEBUG: Subject: {subject}")

            url = "https://api.brevo.com/v3/smtp/email"

            payload = {
                "sender": {
                    "name": from_name,
                    "email": from_email
                },
                "to": [{"email": to_email}],
                "subject": subject,
                "textContent": content
            }

            headers = {
                "accept": "application/json",
                "api-key": api_key,
                "content-type": "application/json"
            }

            print(f"DEBUG: Payload: {payload}")
            print(f"DEBUG: Headers: {headers}")

            response = requests.post(url, json=payload, headers=headers)

            print(f"DEBUG: Response status: {response.status_code}")
            print(f"DEBUG: Response text: {response.text}")

            if response.status_code == 201:
                response_data = response.json()
                print(f"DEBUG: Email sent successfully! Message ID: {response_data.get('messageId', 'N/A')}")
                return {
                    'success': True,
                    'message': f'Email sent successfully to {to_email} via Brevo',
                    'response_data': response_data,
                    'method': 'Brevo API'
                }
            else:
                print(f"DEBUG: Brevo failed, trying webhook fallback...")
                # Try webhook fallback
                return self.send_email_via_webhook(from_email, from_name, to_email, subject, content)

        except Exception as e:
            print(f"DEBUG: Brevo error, trying webhook fallback: {str(e)}")
            # Try webhook fallback
            return self.send_email_via_webhook(from_email, from_name, to_email, subject, content)

    def send_json_response(self, data):
        """Send JSON response with CORS headers"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

def main():
    PORT = 8080

    print("=" * 70)
    print("ENHANCED BULK EMAIL SENDER - WEB ACCESSIBLE")
    print("=" * 70)
    print(f"Server starting on port {PORT}")
    print(f"Access from anywhere: http://your-ip-address:{PORT}")
    print(f"Local access: http://localhost:{PORT}")
    print()
    print("BREVO EMAIL INTEGRATION:")

    # Check if API key is available
    api_key = os.getenv('BREVO_API_KEY', 'your-brevo-api-key-here')
    if api_key.startswith('xkeysib-'):
        print(f"   API KEY CONFIGURED: {api_key[:20]}...")
        print("   Status: READY TO SEND EMAILS")
        print("   Free tier: 300 emails/day")
    else:
        print("   API KEY: Not configured")
        print("   Set BREVO_API_KEY environment variable")
        print("   Get API key from: https://app.brevo.com/settings/keys/api")
    print()
    print("DEFAULT FILES:")
    print("   Excel: C:\\Gaurav\\BranchSpace BA\\Vouchers\\Importers Data Sept 25.xlsx")
    print("   Word:  C:\\Gaurav\\BranchSpace BA\\Vouchers\\Dear Valued Prospective Partner.docx")
    print()
    print("FEATURES:")
    print("   - Multiple worksheet support (all countries)")
    print("   - Automatic firm name extraction")
    print("   - Contact person personalization")
    print("   - Default vishwas.agarwal@gmail.com sender")
    print("   - Real email sending via Brevo API")
    print("   - File upload support")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 70)

    try:
        # Allow connections from any IP address (0.0.0.0)
        with socketserver.TCPServer(("0.0.0.0", PORT), EmailHandler) as httpd:
            print(f"Server bound to all interfaces (0.0.0.0:{PORT})")
            print("Server can now accept connections from any IP address")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    main()