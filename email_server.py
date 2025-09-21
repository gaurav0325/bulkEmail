#!/usr/bin/env python3
"""
Simple HTTP server for the Bulk Email Sender application
This server provides email sending capabilities through SMTP
"""

import http.server
import socketserver
import json
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from urllib.parse import parse_qs, urlparse

class EmailHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.path = '/bulk-email-sender.html'
        return super().do_GET()

    def do_POST(self):
        if self.path == '/send-email':
            self.handle_send_email()
        else:
            self.send_error(404, "Endpoint not found")

    def handle_send_email(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            # Extract email data
            to_email = data.get('to')
            subject = data.get('subject')
            body = data.get('body')

            # Send email
            result = self.send_email(to_email, subject, body)

            # Return response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {
                'success': result['success'],
                'message': result['message']
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {
                'success': False,
                'message': f'Server error: {str(e)}'
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))

    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def send_email(self, to_email, subject, body):
        """
        Send email using SMTP
        Configure your SMTP settings below
        """

        # SMTP Configuration (UPDATE THESE VALUES)
        SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
        SMTP_USERNAME = os.getenv('SMTP_USERNAME', 'your-email@gmail.com')
        SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', 'your-app-password')
        FROM_EMAIL = os.getenv('FROM_EMAIL', SMTP_USERNAME)
        FROM_NAME = os.getenv('FROM_NAME', 'Your Company Name')

        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"{FROM_NAME} <{FROM_EMAIL}>"
            msg['To'] = to_email
            msg['Subject'] = subject

            # Add body to email
            msg.attach(MIMEText(body, 'plain'))

            # Create SMTP session
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()  # Enable TLS encryption
            server.login(SMTP_USERNAME, SMTP_PASSWORD)

            # Send email
            text = msg.as_string()
            server.sendmail(FROM_EMAIL, to_email, text)
            server.quit()

            return {
                'success': True,
                'message': f'Email sent successfully to {to_email}'
            }

        except Exception as e:
            return {
                'success': False,
                'message': f'Failed to send email: {str(e)}'
            }

def main():
    PORT = 8000

    print("="*60)
    print("BULK EMAIL SENDER SERVER")
    print("="*60)
    print(f"Server starting on port {PORT}")
    print(f"Open your browser and go to: http://localhost:{PORT}")
    print("Configure your SMTP settings in the environment variables:")
    print("   - SMTP_SERVER (default: smtp.gmail.com)")
    print("   - SMTP_PORT (default: 587)")
    print("   - SMTP_USERNAME (your email)")
    print("   - SMTP_PASSWORD (your app password)")
    print("   - FROM_EMAIL (sender email)")
    print("   - FROM_NAME (sender name)")
    print("\nFor Gmail, use an 'App Password' instead of your regular password")
    print("   Learn more: https://support.google.com/accounts/answer/185833")
    print("\nPress Ctrl+C to stop the server")
    print("="*60)

    try:
        with socketserver.TCPServer(("", PORT), EmailHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    main()