# International Number Tracker

A Python application for validating, tracking, and managing international phone numbers.

## Features

- ✅ Validate international phone numbers
- 📊 Get detailed information about phone numbers (carrier, region, timezone, type)
- 💾 Store and manage phone numbers in a local database
- 🔍 Search tracked phone numbers
- 📱 Support for various international phone number formats
- 🌍 Global phone number intelligence

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Usage

Run the application:

```bash
python app.py
```

### Supported Phone Number Formats

The application supports various international phone number formats:

- International format: `+2348012345678`, `+12125551234`, `+442071838750`
- Local format with leading zero: `08012345678` (country-specific)
- Local format without leading zero: `8012345678` (country-specific)

### Features in Detail

1. **Validate and Track**: Validate international phone numbers and store them with optional notes
2. **View Tracked Numbers**: See all phone numbers you've tracked with their details
3. **Search**: Search through tracked numbers by phone number, carrier, or notes
4. **Delete**: Remove phone numbers from your tracked list
5. **Get Information**: Analyze any phone number to get detailed information

## Phone Number Information Provided

- **Validation**: Whether the number is valid and possible
- **Carrier**: The mobile network operator (MTN, Airtel, Glo, 9mobile, etc.)
- **Region**: Geographic region associated with the number
- **Timezone**: Time zone information
- **Phone Type**: Mobile, landline, toll-free, etc.
- **Location**: General location description

## Database

The application uses SQLite to store phone number records locally. The database file `phone_numbers.db` is created automatically when you first run the application.

## Dependencies

- `phonenumbers`: Python library for parsing, formatting, and validating international phone numbers

## International Phone Number Support

- **Global Coverage**: Supports phone numbers from all countries
- **Country Codes**: Automatically detects and validates country codes
- **Carrier Detection**: Identifies mobile network operators worldwide
- **Number Types**: Distinguishes between mobile, landline, toll-free, VoIP, etc.

## Example Usage

```python
from international_number_tracker import InternationalNumberTracker

# Initialize tracker
tracker = InternationalNumberTracker()

# Validate a number
is_valid = tracker.validate_international_number("+2348012345678")

# Get phone number information
info = tracker.get_phone_info("+2348012345678")

# Track a number
tracker.track_phone_number("+2348012345678", "Business contact")

# Get all tracked numbers
tracked = tracker.get_tracked_numbers()
```

## License

This project is open source and available under the MIT License.

Created by www.github.com/ohansfav and xline Agent. 