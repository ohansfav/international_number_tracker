# International Number Tracker - Professional Edition

A professional, cross-platform desktop application for validating, tracking, and managing international phone numbers with advanced analytics and export capabilities.

## 🌟 Features

### Core Functionality
- ✅ **Phone Number Validation**: Real-time validation of international phone numbers
- 📊 **Detailed Information**: Carrier, region, timezone, phone type detection
- 💾 **Local Database**: SQLite-based storage for offline access
- 🔍 **Advanced Search**: Multi-criteria search and filtering
- 📱 **Multiple Formats**: Support for international and local number formats

### Professional Interface
- 🖥️ **Cross-Platform**: Windows, macOS, and Linux support
- 🎨 **Corporate Design**: Professional UI with modern styling
- 📱 **Responsive Layout**: Adapts to different screen sizes
- ⚡ **Real-time Updates**: Live data synchronization
- 🌙 **Dark Mode**: Automatic theme switching support

### Data Management
- 📊 **Analytics Dashboard**: Visual charts and statistics
- 📈 **Carrier Distribution**: Interactive doughnut charts
- 📋 **Phone Type Analysis**: Bar charts for number categorization
- 🔄 **Real-time Stats**: Live dashboard updates

### Export Capabilities
- 📄 **CSV Export**: Customizable field selection
- 📋 **JSON Export**: Structured data with metadata
- 🖨️ **PDF Reports**: Professional report generation
- 📊 **Excel Export**: Multi-sheet workbooks
- 💾 **Backup/Restore**: Complete database backups

### Import Functionality
- 📁 **CSV Import**: Bulk phone number import
- ✅ **Validation**: Automatic validation during import
- 📊 **Error Reporting**: Detailed import results
- 🏷️ **Notes Support**: Import notes with numbers

## 🚀 Installation

### Prerequisites
- **Python 3.7+**: [Download Python](https://python.org)
- **Node.js 16+**: [Download Node.js](https://nodejs.org)
- **npm**: Comes with Node.js

### Quick Start (Windows)
1. Double-click `run.bat` and follow the prompts
2. The installer will check dependencies and install everything needed
3. Launch the application when prompted

### Manual Installation

1. **Clone or download** the project
2. **Navigate to the project directory**:
   ```bash
   cd international_number_tracker
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Node.js dependencies**:
   ```bash
   cd electron
   npm install
   cd ..
   ```

5. **Run the application**:
   ```bash
   cd electron
   npm start
   ```

## 📱 Usage Guide

### Tracking Phone Numbers

1. **Launch the application** using the desktop shortcut or command line
2. **Navigate to "Track Number"** from the sidebar
3. **Enter a phone number** in any supported format:
   - International: `+2348012345678`, `+12125551234`, `+442071838750`
   - Local with zero: `08012345678` (country-specific)
   - Local without zero: `8012345678` (country-specific)
4. **Click "Validate"** to check if the number is valid
5. **Add optional notes** about the contact
6. **Click "Track Number"** to save it to your database

### Managing Tracked Numbers

1. **Go to "Tracked Numbers"** to view all saved numbers
2. **Use the search bar** to find specific numbers
3. **Sort and paginate** through large datasets
4. **View details** by clicking the eye icon
5. **Delete numbers** using the trash icon

### Analytics and Reports

1. **Visit the "Analytics"** page for visual insights
2. **View carrier distribution** in interactive charts
3. **Analyze phone type patterns**
4. **Export charts** as images for presentations

### Data Export

1. **Click "Export"** in the top navigation
2. **Choose your preferred format**: CSV, JSON, or PDF
3. **Customize export options** (if applicable)
4. **Download the file** to your computer

### Bulk Import

1. **Click "Import"** in the navigation
2. **Select a CSV file** with phone numbers
3. **Review import results** including any errors
4. **Numbers are automatically validated** and tracked

## 🏗️ Architecture

### Frontend (Electron + Web Technologies)
- **Main Process**: Electron window management and system integration
- **Renderer Process**: Modern web interface with Bootstrap 5
- **UI Framework**: Professional corporate design theme
- **Charts**: Chart.js for data visualization
- **Icons**: Bootstrap Icons for consistent visual language

### Backend (Flask API)
- **RESTful API**: Clean endpoint structure
- **Database**: SQLite for local storage
- **Validation**: Integration with phonenumbers library
- **Export**: Multiple format support
- **Security**: CORS enabled for Electron communication

### Core Logic
- **Phone Tracking**: Original InternationalNumberTracker class
- **Validation**: Comprehensive international number validation
- **Carrier Detection**: Real-time carrier identification
- **Geolocation**: Region and location mapping

## 📁 Project Structure

```
international_number_tracker/
├── app.py                    # Core phone tracking logic
├── requirements.txt          # Python dependencies
├── run.bat                  # Windows installer/launcher
├── electron/                 # Electron application
│   ├── main.js             # Electron main process
│   ├── package.json        # Node.js dependencies
│   ├── preload.js          # Security bridge
│   └── build/              # Build output
├── web/                     # Web interface
│   ├── index.html          # Main application UI
│   ├── css/                # Stylesheets
│   │   └── corporate-theme.css
│   ├── js/                 # Frontend JavaScript
│   │   ├── api.js          # API service
│   │   ├── app.js          # Main app controller
│   │   ├── charts.js       # Analytics charts
│   │   └── export.js       # Export functionality
│   └── api/                # Flask backend
│       ├── app.py          # Flask API server
│       ├── routes/         # API endpoints
│       ├── models/         # Data models
│       └── utils/          # Utility functions
└── assets/                  # Static assets
    ├── icons/              # Application icons
    └── reports/            # Generated reports
```

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV`: Set to 'development' for debug mode
- `FLASK_DEBUG`: Enable Flask debugging
- `ELECTRON_IS_DEV`: Development mode detection

### Customization
- **Theme**: Modify `web/css/corporate-theme.css`
- **API Endpoints**: Extend `web/api/app.py`
- **Database Schema**: Update core logic in `app.py`
- **Export Formats**: Add new formats in `web/js/export.js`

## 📊 Supported Phone Number Formats

### International Format
- `+2348012345678` - Standard international format
- `+12125551234` - US format
- `+442071838750` - UK format
- `+234 801 234 5678` - With spaces
- `+234-801-234-5678` - With hyphens

### Local Formats
- `08012345678` - With leading zero (country-specific)
- `8012345678` - Without leading zero (country-specific)
- `0801-234-5678` - With hyphens
- `0801 234 5678` - With spaces

## 📈 Analytics Features

### Dashboard Statistics
- **Total Numbers**: Count of all tracked numbers
- **Valid Numbers**: Count of valid international numbers
- **Invalid Numbers**: Count of invalid entries
- **Recent Activity**: Numbers added in the last 24 hours

### Visual Charts
- **Carrier Distribution**: Doughnut chart showing carrier market share
- **Phone Type Analysis**: Bar chart of mobile vs landline numbers
- **Activity Timeline**: Time-based tracking activity

### Export Options
- **Chart Images**: Export charts as PNG files
- **Data Tables**: Export raw data in multiple formats
- **Summary Reports**: PDF reports with statistics

## 🛡️ Security Features

- **Input Validation**: All user inputs are validated
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: HTML escaping in web interface
- **Secure File Handling**: Safe file upload/download
- **Local Storage**: Data stored locally, no cloud transmission

## 🔄 Data Synchronization

### Real-time Updates
- **Live Dashboard**: Statistics update automatically
- **Instant Validation**: Real-time phone number validation
- **Dynamic Charts**: Charts update with new data

### Offline Capability
- **Local Database**: Full functionality without internet
- **Cached Data**: Recent data available offline
- **Sync on Connect**: Automatic synchronization when online

## 🐛 Troubleshooting

### Common Issues

#### Application Won't Start
1. **Check Python installation**: Run `python --version`
2. **Check Node.js installation**: Run `node --version`
3. **Install dependencies**: Run `run.bat` again
4. **Check port availability**: Ensure port 5000 is free

#### Phone Number Validation Fails
1. **Verify format**: Use supported international phone formats
2. **Check internet**: Some validation features require internet
3. **Update phonenumbers**: `pip install --upgrade phonenumbers`

#### Export/Import Issues
1. **File permissions**: Ensure write access to download folder
2. **File format**: Verify CSV format for imports
3. **Disk space**: Ensure sufficient storage for exports

#### Performance Issues
1. **Large datasets**: Use search and pagination
2. **Memory usage**: Restart application if it becomes slow
3. **Database size**: Consider archiving old records

### Getting Help

1. **Check logs**: Console output for error messages
2. **Review documentation**: This README and inline comments
3. **Test dependencies**: Run validation commands
4. **Restart application**: Many issues resolve with restart

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

## 📞 Support

For support, feature requests, or bug reports:
- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue in the project repository
- **Community**: Join discussions in the project forums

## 🗺️ Roadmap

### Planned Features
- [ ] **Advanced PDF Reports**: Professional PDF generation with charts
- [ ] **User Management**: Multi-user support with authentication
- [ ] **Cloud Sync**: Optional cloud synchronization
- [ ] **Mobile App**: Companion mobile application
- [ ] **API Integration**: Third-party API connections
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **Batch Operations**: Bulk editing and operations
- [ ] **Custom Fields**: User-defined data fields

### Version History
- **v2.0.0**: Professional Electron interface with analytics
- **v1.0.0**: Original command-line version

---

**International Number Tracker - Professional Edition**  
*Empowering businesses and professionals with advanced international phone number management*
