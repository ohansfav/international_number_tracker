#!/usr/bin/env python3
"""
Flask API Backend for International Number Tracker
Provides RESTful API endpoints for the Electron frontend
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sys
import os
import json
import csv
import io
import sqlite3
from datetime import datetime
from werkzeug.utils import secure_filename

# Add the parent directory to the path to import the existing phone tracker
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app import InternationalNumberTracker

app = Flask(__name__)
CORS(app)

# Initialize the phone tracker
tracker = InternationalNumberTracker()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0'
    })

@app.route('/api/validate', methods=['POST'])
def validate_phone_number():
    """Validate an international phone number"""
    try:
        data = request.get_json()
        phone_number = data.get('phone_number')
        
        if not phone_number:
            return jsonify({'error': 'Phone number is required'}), 400
        
        is_valid = tracker.validate_international_number(phone_number)
        return jsonify({
            'phone_number': phone_number,
            'is_valid': is_valid
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/info', methods=['POST'])
def get_phone_info():
    """Get detailed information about a phone number"""
    try:
        data = request.get_json()
        phone_number = data.get('phone_number')
        
        if not phone_number:
            return jsonify({'error': 'Phone number is required'}), 400
        
        info = tracker.get_phone_info(phone_number)
        return jsonify(info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/enhanced-info', methods=['POST'])
def get_enhanced_phone_info():
    """Get comprehensive phone number information including owner and location data"""
    try:
        data = request.get_json()
        phone_number = data.get('phone_number')
        
        if not phone_number:
            return jsonify({'error': 'Phone number is required'}), 400
        
        info = tracker.get_enhanced_phone_info(phone_number)
        return jsonify(info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/owner-info', methods=['POST'])
def get_owner_info():
    """Get owner information for a phone number"""
    try:
        data = request.get_json()
        phone_number = data.get('phone_number')
        
        if not phone_number:
            return jsonify({'error': 'Phone number is required'}), 400
        
        owner_info = tracker.lookup_owner_info(phone_number)
        return jsonify(owner_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/location-info', methods=['POST'])
def get_location_info():
    """Get detailed location information for a phone number"""
    try:
        data = request.get_json()
        phone_number = data.get('phone_number')
        
        if not phone_number:
            return jsonify({'error': 'Phone number is required'}), 400
        
        location_info = tracker.get_location_info(phone_number)
        return jsonify(location_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/track', methods=['POST'])
def track_phone_number():
    """Track a phone number"""
    try:
        data = request.get_json()
        phone_number = data.get('phone_number')
        notes = data.get('notes', '')
        
        if not phone_number:
            return jsonify({'error': 'Phone number is required'}), 400
        
        success = tracker.track_phone_number(phone_number, notes)
        if success:
            return jsonify({
                'success': True,
                'message': 'Phone number tracked successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to track phone number'
            }), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/numbers', methods=['GET'])
def get_tracked_numbers():
    """Get all tracked phone numbers"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search', '')
        
        if search:
            numbers = tracker.search_numbers(search)
        else:
            numbers = tracker.get_tracked_numbers()
        
        # Pagination
        start = (page - 1) * per_page
        end = start + per_page
        paginated_numbers = numbers[start:end]
        
        return jsonify({
            'numbers': paginated_numbers,
            'total': len(numbers),
            'page': page,
            'per_page': per_page,
            'pages': (len(numbers) + per_page - 1) // per_page
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/numbers/<phone_number>', methods=['DELETE'])
def delete_tracked_number(phone_number):
    """Delete a tracked phone number"""
    try:
        success = tracker.delete_tracked_number(phone_number)
        if success:
            return jsonify({
                'success': True,
                'message': 'Phone number deleted successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Phone number not found'
            }), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['GET'])
def search_numbers():
    """Search for phone numbers"""
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        results = tracker.search_numbers(query)
        return jsonify({
            'results': results,
            'count': len(results)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    """Export tracked numbers as CSV"""
    try:
        numbers = tracker.get_tracked_numbers()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Phone Number', 'Carrier', 'Region', 'Timezone', 'Phone Type', 'Date Added', 'Last Tracked', 'Notes'])
        
        # Write data
        for num in numbers:
            writer.writerow([
                num['phone_number'],
                num['carrier'],
                num['region'],
                num['timezone'],
                num['phone_type'],
                num['date_added'],
                num['last_tracked'],
                num['notes']
            ])
        
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'international_number_tracker_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/json', methods=['GET'])
def export_json():
    """Export tracked numbers as JSON"""
    try:
        numbers = tracker.get_tracked_numbers()
        
        export_data = {
            'export_date': datetime.now().isoformat(),
            'total_records': len(numbers),
            'data': numbers
        }
        
        output = io.StringIO()
        json.dump(export_data, output, indent=2, default=str)
        output.seek(0)
        
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='application/json',
            as_attachment=True,
            download_name=f'international_number_tracker_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/import/csv', methods=['POST'])
def import_csv():
    """Import phone numbers from CSV file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and file.filename.endswith('.csv'):
            stream = io.StringIO(file.stream.read().decode("utf-8"))
            csv_reader = csv.reader(stream)
            
            # Skip header
            next(csv_reader)
            
            imported = 0
            errors = []
            
            for row in csv_reader:
                if len(row) >= 1:
                    phone_number = row[0].strip()
                    notes = row[7] if len(row) > 7 else ''
                    
                    if tracker.validate_international_number(phone_number):
                        if tracker.track_phone_number(phone_number, notes):
                            imported += 1
                        else:
                            errors.append(f"Failed to track: {phone_number}")
                    else:
                        errors.append(f"Invalid number: {phone_number}")
            
            return jsonify({
                'imported': imported,
                'errors': errors,
                'total': imported + len(errors)
            })
        else:
            return jsonify({'error': 'Invalid file format. Please upload a CSV file.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_statistics():
    """Get application statistics"""
    try:
        numbers = tracker.get_tracked_numbers()
        
        # Calculate statistics
        total_numbers = len(numbers)
        valid_numbers = sum(1 for num in numbers if num['is_valid'])
        
        # Carrier distribution
        carriers = {}
        for num in numbers:
            carrier = num['carrier'] or 'Unknown'
            carriers[carrier] = carriers.get(carrier, 0) + 1
        
        # Phone type distribution
        phone_types = {}
        for num in numbers:
            phone_type = num['phone_type'] or 'Unknown'
            phone_types[phone_type] = phone_types.get(phone_type, 0) + 1
        
        # Recent activity (last 7 days)
        recent_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        recent_numbers = [num for num in numbers if 
                         datetime.fromisoformat(num['date_added'].replace('Z', '+00:00')) >= recent_date]
        
        return jsonify({
            'total_numbers': total_numbers,
            'valid_numbers': valid_numbers,
            'invalid_numbers': total_numbers - valid_numbers,
            'carrier_distribution': carriers,
            'phone_type_distribution': phone_types,
            'recent_activity': len(recent_numbers),
            'last_updated': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/backup', methods=['POST'])
def backup_database():
    """Create a backup of the database"""
    try:
        import shutil
        from datetime import datetime
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"phone_numbers_backup_{timestamp}.db"
        backup_path = os.path.join(os.path.dirname(__file__), backup_filename)
        
        shutil.copy2(tracker.db_path, backup_path)
        
        return send_file(
            backup_path,
            mimetype='application/x-sqlite3',
            as_attachment=True,
            download_name=backup_filename
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/clear', methods=['POST'])
def clear_all_data():
    """Clear all tracked phone numbers"""
    try:
        conn = sqlite3.connect(tracker.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM phone_records')
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'All data cleared successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
