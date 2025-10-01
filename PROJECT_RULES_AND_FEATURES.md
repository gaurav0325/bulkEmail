# Project Rules and Features - Complete Reference

## 🎯 Project Mission

**Build a comprehensive bulk email application with advanced contact management, rich text editing, AI-powered message enhancement, and production-ready email delivery through Zoho SMTP.**

## 📋 Core Project Rules

### **🚀 Deployment Rule (CRITICAL)**
**All code changes MUST be automatically pushed to production on Netlify without requiring user reminders.**

**Workflow**:
1. Make code changes
2. Test locally if needed
3. Git add, commit with descriptive message
4. **ALWAYS git push to main branch immediately**
5. Netlify auto-deploys to https://bulkemailvishwas.netlify.app

**Never skip the push step** - production deployment is mandatory for all changes.

### **🎯 Scope Limitation Rule (CRITICAL)**
**When working on one enhancement, NEVER change other unrelated functionalities without explicit user confirmation.**

**Development Scope Rule**:
1. **Focus Only**: Work exclusively on the requested enhancement or bug fix
2. **No Side Changes**: Do not modify, improve, or "fix" unrelated features
3. **Scope Boundary**: Stay within exact boundaries of user's request
4. **Confirm First**: If related changes seem necessary, ask for explicit permission
5. **One Thing**: Complete one enhancement fully before considering others

**This prevents unintended modifications and maintains system stability.**

### **📧 Email Configuration Rule**
**Always use authorized domain sender (info@datanalysisninsights.co.uk) for SMTP authentication and deliverability.**

**Email Rules**:
- ✅ Sender: "Intex Technologies <info@datanalysisninsights.co.uk>"
- ✅ Reply-To: info@datanalysisninsights.co.uk
- ✅ Authentication: Via Zoho SMTP credentials
- ❌ Never use unauthorized sender domains
- ❌ Never create sender/header mismatches

## 🎨 User Experience Rules

### **Design Consistency**
- **Font Family**: Inter (Google Fonts)
- **Color Scheme**: Professional blues and grays
- **Button Style**: Modern with hover effects
- **Layout**: Responsive grid with clear sections
- **Icons**: Professional, consistent style

### **Accessibility Requirements**
- **WCAG 2.1 AA Compliance**: All interactive elements
- **ARIA Labels**: For screen readers
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: Sufficient for readability
- **Font Size**: Minimum 14px for readability

### **Performance Standards**
- **Load Time**: <3 seconds initial load
- **File Processing**: <10 seconds for 1000+ contacts
- **Memory Usage**: <500MB for typical operations
- **Response Time**: <200ms for UI interactions

## ✨ Feature Categories

### **🚀 Core Email Management**
1. **Rich Text Editor**
   - ✅ Bold, italic, underline formatting
   - ✅ Color highlighting with palette
   - ✅ Bullet and numbered lists
   - ✅ Text alignment and indentation
   - ✅ Link insertion and management
   - ✅ Undo/redo functionality
   - ✅ Clear formatting option
   - ✅ Visual feedback in contenteditable div

2. **Email Composition**
   - ✅ Subject line with personalization
   - ✅ Message body with rich formatting
   - ✅ Template variable replacement
   - ✅ Real-time preview
   - ✅ Draft saving capability

3. **Email Sending**
   - ✅ Individual email sending
   - ✅ Netlify function integration
   - ✅ Zoho SMTP authentication
   - ✅ Success/failure tracking
   - ✅ Comprehensive error handling

### **📁 Advanced File Processing**
1. **Multi-Document Support**
   - ✅ Excel files (.xlsx, .xls)
   - ✅ CSV files with custom delimiters
   - ✅ PDF documents with text extraction
   - ✅ Word documents (.doc, .docx)
   - ✅ PowerPoint presentations (.ppt, .pptx)
   - ✅ Images with OCR simulation

2. **Intelligent Data Extraction**
   - ✅ AI contact extraction
   - ✅ Header pattern recognition
   - ✅ Multi-table Excel processing
   - ✅ Cross-worksheet data collection
   - ✅ Contact validation and cleanup

3. **File Management**
   - ✅ Drag and drop upload
   - ✅ File type validation
   - ✅ Size limit enforcement
   - ✅ Progress tracking
   - ✅ Error handling

### **👥 Contact Management**
1. **Contact Processing**
   - ✅ Automatic contact extraction
   - ✅ Data validation and cleanup
   - ✅ Duplicate detection
   - ✅ Country-based organization
   - ✅ Firm name validation

2. **Contact Selection**
   - ✅ Individual contact selection
   - ✅ Search and filtering
   - ✅ Contact preview
   - ✅ Selection state management

3. **Contact Personalization**
   - ✅ Dynamic content generation
   - ✅ Template variable replacement
   - ✅ Context-aware messaging
   - ✅ Auto-population on selection

### **🤖 Smart Message AI Assistant**
1. **AI Integration**
   - ✅ ChatGPT-like interface
   - ✅ Context-aware enhancement
   - ✅ Multiple enhancement types
   - ✅ Real-time preview
   - ✅ Apply/reject functionality

2. **Enhancement Types**
   - ✅ Professional tone optimization
   - ✅ Compelling value propositions
   - ✅ Concise message creation
   - ✅ Industry-specific insights
   - ✅ Grammar and clarity improvements

3. **Quick Actions**
   - ✅ One-click enhancements
   - ✅ Template suggestions
   - ✅ Content optimization
   - ✅ Personalization recommendations

### **📊 Analytics & Tracking**
1. **Email Analytics**
   - ✅ Success/failure rate tracking
   - ✅ Country-based performance
   - ✅ Date filtering capabilities
   - ✅ Performance metrics dashboard
   - ✅ Export functionality

2. **Data Visualization**
   - ✅ Success rate charts
   - ✅ Geographic distribution
   - ✅ Time-based analytics
   - ✅ Performance trends

3. **Reporting**
   - ✅ Detailed email logs
   - ✅ Export capabilities
   - ✅ Performance summaries
   - ✅ Error tracking

## 🔧 Technical Architecture Rules

### **Frontend Architecture**
- **Single Page Application**: No backend required
- **Modular JavaScript**: Functions organized by feature
- **Progressive Enhancement**: Works on all modern browsers
- **Responsive Design**: Mobile-first approach
- **Error Handling**: Comprehensive try-catch blocks

### **Data Processing Rules**
- **Client-Side Only**: No server data storage
- **Memory Management**: Automatic cleanup
- **Chunked Processing**: Large files in segments
- **Progress Tracking**: Real-time feedback
- **Error Recovery**: Graceful failure handling

### **Security Requirements**
- **Input Validation**: All user inputs validated
- **HTML Sanitization**: DOMPurify for XSS prevention
- **File Validation**: Type and size checking
- **Environment Variables**: Secure credential storage
- **HTTPS Only**: All communications encrypted

## 🎨 UI/UX Guidelines

### **Layout Principles**
- **Clear Hierarchy**: Important elements prominent
- **Logical Flow**: Left-to-right, top-to-bottom
- **Consistent Spacing**: 15px standard margins
- **Visual Grouping**: Related elements together
- **Action Clarity**: Clear call-to-action buttons

### **Color Scheme**
- **Primary**: #007bff (Professional blue)
- **Success**: #28a745 (Green)
- **Warning**: #ffc107 (Yellow)
- **Danger**: #dc3545 (Red)
- **Background**: #f8f9fa (Light gray)
- **Text**: #333 (Dark gray)

### **Typography**
- **Font Family**: Inter, sans-serif
- **Body Text**: 14px minimum
- **Headers**: Bold, hierarchical sizing
- **Labels**: 14px, bold, consistent
- **Code/Technical**: Monospace font

## 📝 Documentation Standards

### **Code Documentation**
- **Function Comments**: Clear purpose and parameters
- **Complex Logic**: Inline explanations
- **API Integration**: Usage examples
- **Error Handling**: Expected behaviors
- **Performance Notes**: Optimization details

### **User Documentation**
- **Feature Descriptions**: Clear, concise explanations
- **Usage Instructions**: Step-by-step guides
- **Troubleshooting**: Common issues and solutions
- **Configuration**: Setup requirements
- **Examples**: Real-world use cases

### **Technical Documentation**
- **Architecture Diagrams**: System overview
- **API Documentation**: Endpoint details
- **Deployment Guide**: Step-by-step instructions
- **Environment Setup**: Requirements and configuration
- **Change Log**: Version history

## 🚀 Future Enhancement Guidelines

### **Priority Framework**
1. **Critical**: Security, performance, core functionality
2. **High**: User experience, reliability, accessibility
3. **Medium**: New features, optimizations, integrations
4. **Low**: Nice-to-have features, visual enhancements

### **Feature Addition Rules**
- **User Request**: Must be explicitly requested
- **Scope Defined**: Clear boundaries and requirements
- **Testing Plan**: How to verify functionality
- **Documentation**: Update relevant docs
- **Deployment**: Follow standard workflow

---

**Rules Status**: ✅ ESTABLISHED AND ACTIVE
**Last Updated**: January 27, 2025
**Compliance**: Mandatory for all development
**Review**: Quarterly updates as needed