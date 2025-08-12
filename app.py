#!/usr/bin/env python3
"""
International Number Tracker Application
A Python application for validating, tracking, and managing international phone numbers.
"""

import re
import json
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import phonenumbers
from phonenumbers import carrier, geocoder, timezone
import requests
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import reverse_geocoder as rg
import folium

class InternationalNumberTracker:
    """
    A class to track and manage international phone numbers with TrueCaller-like features.
    """
    
    def __init__(self, db_path: str = "phone_numbers.db"):
        """Initialize the phone tracker with database connection."""
        self.db_path = db_path
        self.init_database()
        self.geolocator = Nominatim(user_agent="international_number_tracker")
        
    def init_database(self):
        """Initialize the SQLite database for storing phone number records."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS phone_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone_number TEXT UNIQUE NOT NULL,
                carrier TEXT,
                region TEXT,
                timezone TEXT,
                is_valid BOOLEAN,
                phone_type TEXT,
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_tracked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notes TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def validate_international_number(self, phone_number: str) -> bool:
        """
        Validate if a phone number is a valid international number.
        
        Args:
            phone_number: The phone number to validate
            
        Returns:
            bool: True if valid international number, False otherwise
        """
        try:
            # Parse the phone number
            parsed_number = phonenumbers.parse(phone_number, "NG")
            
            # Check if it's a valid number
            if not phonenumbers.is_valid_number(parsed_number):
                return False
            
            # Check if it's a valid international number
            return phonenumbers.is_valid_number(parsed_number)
            
        except phonenumbers.NumberParseException:
            return False
    
    def get_phone_info(self, phone_number: str) -> Dict:
        """
        Get detailed information about an international phone number.
        
        Args:
            phone_number: The phone number to analyze
            
        Returns:
            Dict: Dictionary containing phone number information
        """
        try:
            parsed_number = phonenumbers.parse(phone_number, None)
            
            info = {
                'phone_number': phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.INTERNATIONAL),
                'national_format': phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.NATIONAL),
                'is_valid': phonenumbers.is_valid_number(parsed_number),
                'is_possible': phonenumbers.is_possible_number(parsed_number),
                'country_code': parsed_number.country_code,
                'national_number': parsed_number.national_number,
                'region': phonenumbers.region_code_for_number(parsed_number),
                'carrier': carrier.name_for_number(parsed_number, "en"),
                'timezone': timezone.time_zones_for_number(parsed_number),
                'phone_type': self._get_phone_type(parsed_number),
                'location': geocoder.description_for_number(parsed_number, "en")
            }
            
            return info
            
        except phonenumbers.NumberParseException as e:
            return {
                'phone_number': phone_number,
                'is_valid': False,
                'error': str(e)
            }
    
    def _get_phone_type(self, parsed_number) -> str:
        """Determine the type of phone number (mobile, landline, etc.)."""
        number_type = phonenumbers.number_type(parsed_number)
        
        type_mapping = {
            phonenumbers.PhoneNumberType.MOBILE: "Mobile",
            phonenumbers.PhoneNumberType.FIXED_LINE: "Landline",
            phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE: "Fixed Line or Mobile",
            phonenumbers.PhoneNumberType.TOLL_FREE: "Toll Free",
            phonenumbers.PhoneNumberType.PREMIUM_RATE: "Premium Rate",
            phonenumbers.PhoneNumberType.SHARED_COST: "Shared Cost",
            phonenumbers.PhoneNumberType.VOIP: "VoIP",
            phonenumbers.PhoneNumberType.PERSONAL_NUMBER: "Personal Number",
            phonenumbers.PhoneNumberType.PAGER: "Pager",
            phonenumbers.PhoneNumberType.UAN: "UAN",
            phonenumbers.PhoneNumberType.UNKNOWN: "Unknown"
        }
        
        return type_mapping.get(number_type, "Unknown")
    
    def track_phone_number(self, phone_number: str, notes: str = "") -> bool:
        """
        Track a phone number by storing its information in the database.
        
        Args:
            phone_number: The phone number to track
            notes: Optional notes about the phone number
            
        Returns:
            bool: True if successfully tracked, False otherwise
        """
        if not self.validate_international_number(phone_number):
            return False
        
        info = self.get_phone_info(phone_number)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO phone_records 
                (phone_number, carrier, region, timezone, is_valid, phone_type, last_tracked, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                info['phone_number'],
                info['carrier'],
                info['region'],
                str(info['timezone']),
                info['is_valid'],
                info['phone_type'],
                datetime.now().isoformat(),
                notes
            ))
            
            conn.commit()
            return True
            
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return False
        finally:
            conn.close()
    
    def get_tracked_numbers(self) -> List[Dict]:
        """
        Retrieve all tracked phone numbers from the database.
        
        Returns:
            List[Dict]: List of tracked phone number records
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM phone_records ORDER BY date_added DESC')
        records = cursor.fetchall()
        
        conn.close()
        
        columns = ['id', 'phone_number', 'carrier', 'region', 'timezone', 'is_valid', 
                  'phone_type', 'date_added', 'last_tracked', 'notes']
        
        return [dict(zip(columns, record)) for record in records]
    
    def search_numbers(self, query: str) -> List[Dict]:
        """
        Search for phone numbers based on various criteria.
        
        Args:
            query: Search query (phone number, carrier, etc.)
            
        Returns:
            List[Dict]: Matching phone number records
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM phone_records 
            WHERE phone_number LIKE ? OR carrier LIKE ? OR region LIKE ? OR notes LIKE ?
            ORDER BY date_added DESC
        ''', (f'%{query}%', f'%{query}%', f'%{query}%', f'%{query}%'))
        
        records = cursor.fetchall()
        conn.close()
        
        columns = ['id', 'phone_number', 'carrier', 'region', 'timezone', 'is_valid', 
                  'phone_type', 'date_added', 'last_tracked', 'notes']
        
        return [dict(zip(columns, record)) for record in records]
    
    def delete_tracked_number(self, phone_number: str) -> bool:
        """
        Delete a tracked phone number from the database.
        
        Args:
            phone_number: The phone number to delete
            
        Returns:
            bool: True if successfully deleted, False otherwise
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('DELETE FROM phone_records WHERE phone_number = ?', (phone_number,))
            conn.commit()
            return cursor.rowcount > 0
        except sqlite3.Error:
            return False
        finally:
            conn.close()
    
    def lookup_owner_info(self, phone_number: str) -> Dict:
        """
        Lookup owner information for a phone number using various APIs.
        This is a simulation - in production, you'd use legitimate APIs.
        
        Args:
            phone_number: The phone number to lookup
            
        Returns:
            Dict: Dictionary containing owner information
        """
        try:
            # Parse the phone number to get country info
            parsed_number = phonenumbers.parse(phone_number, None)
            country_code = parsed_number.country_code
            region = phonenumbers.region_code_for_number(parsed_number)
            
            # Simulate API lookup - in production, use legitimate services
            # This is a mock implementation for demonstration
            owner_info = {
                'phone_number': phone_number,
                'name': self._generate_mock_name(region),
                'email': self._generate_mock_email(phone_number),
                'social_profiles': self._generate_mock_social_profiles(),
                'risk_score': self._calculate_risk_score(phone_number),
                'spam_probability': self._calculate_spam_probability(phone_number),
                'lookup_timestamp': datetime.now().isoformat()
            }
            
            return owner_info
            
        except Exception as e:
            return {
                'phone_number': phone_number,
                'error': str(e),
                'lookup_timestamp': datetime.now().isoformat()
            }
    
    def get_location_info(self, phone_number: str) -> Dict:
        """
        Get detailed location information for a phone number.
        
        Args:
            phone_number: The phone number to geolocate
            
        Returns:
            Dict: Dictionary containing location information
        """
        try:
            # Get basic location from phone number
            parsed_number = phonenumbers.parse(phone_number, None)
            region = phonenumbers.region_code_for_number(parsed_number)
            basic_location = geocoder.description_for_number(parsed_number, "en")
            
            # Get detailed location using geopy
            detailed_location = {}
            if basic_location:
                try:
                    location = self.geolocator.geocode(basic_location)
                    if location:
                        detailed_location = {
                            'latitude': location.latitude,
                            'longitude': location.longitude,
                            'address': location.address,
                            'city': location.raw.get('address', {}).get('city', ''),
                            'state': location.raw.get('address', {}).get('state', ''),
                            'country': location.raw.get('address', {}).get('country', ''),
                            'postcode': location.raw.get('address', {}).get('postcode', '')
                        }
                except (GeocoderTimedOut, GeocoderServiceError):
                    pass
            
            # Generate map using folium
            map_html = None
            if detailed_location.get('latitude') and detailed_location.get('longitude'):
                try:
                    m = folium.Map(
                        location=[detailed_location['latitude'], detailed_location['longitude']],
                        zoom_start=12
                    )
                    folium.Marker(
                        [detailed_location['latitude'], detailed_location['longitude']],
                        popup=f"Phone: {phone_number}<br>Location: {basic_location}"
                    ).add_to(m)
                    map_html = m._repr_html_()
                except Exception:
                    pass
            
            location_info = {
                'phone_number': phone_number,
                'basic_location': basic_location,
                'region': region,
                'detailed_location': detailed_location,
                'map_html': map_html,
                'timestamp': datetime.now().isoformat()
            }
            
            return location_info
            
        except Exception as e:
            return {
                'phone_number': phone_number,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def get_enhanced_phone_info(self, phone_number: str) -> Dict:
        """
        Get comprehensive phone number information including owner and location data.
        
        Args:
            phone_number: The phone number to analyze
            
        Returns:
            Dict: Complete phone number information
        """
        # Get basic phone info
        basic_info = self.get_phone_info(phone_number)
        
        # Get owner information
        owner_info = self.lookup_owner_info(phone_number)
        
        # Get location information
        location_info = self.get_location_info(phone_number)
        
        # Combine all information
        enhanced_info = {
            **basic_info,
            'owner_info': owner_info,
            'location_info': location_info,
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        return enhanced_info
    
    def _generate_mock_name(self, region: str) -> str:
        """Generate a mock name based on region."""
        names_by_region = {
            'US': ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis'],
            'NG': ['Adebayo Okafor', 'Fatima Abubakar', 'Chukwuemeka Nwosu', 'Aisha Bello'],
            'GB': ['James Wilson', 'Emma Thompson', 'Oliver Jones', 'Sophia Williams'],
            'IN': ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Ananya Reddy'],
            'CA': ['David Martin', 'Lisa Anderson', 'Ryan Taylor', 'Jessica Thomas']
        }
        
        names = names_by_region.get(region, names_by_region['US'])
        import random
        return random.choice(names)
    
    def _generate_mock_email(self, phone_number: str) -> str:
        """Generate a mock email based on phone number."""
        import random
        domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
        domain = random.choice(domains)
        
        # Use last few digits of phone number
        clean_number = ''.join(filter(str.isdigit, phone_number))
        if len(clean_number) >= 4:
            username = f"user{clean_number[-4:]}"
        else:
            username = f"user{random.randint(1000, 9999)}"
        
        return f"{username}@{domain}"
    
    def _generate_mock_social_profiles(self) -> Dict:
        """Generate mock social media profiles."""
        import random
        platforms = ['linkedin', 'twitter', 'facebook', 'instagram']
        profiles = {}
        
        for platform in random.sample(platforms, random.randint(1, 3)):
            profiles[platform] = f"https://{platform}.com/user{random.randint(10000, 99999)}"
        
        return profiles
    
    def _calculate_risk_score(self, phone_number: str) -> float:
        """Calculate a mock risk score for the phone number."""
        import random
        # Generate a risk score between 0.0 (low risk) and 1.0 (high risk)
        return round(random.uniform(0.1, 0.9), 2)
    
    def _calculate_spam_probability(self, phone_number: str) -> float:
        """Calculate a mock spam probability for the phone number."""
        import random
        # Generate spam probability between 0.0 (low spam) and 1.0 (high spam)
        return round(random.uniform(0.05, 0.6), 2)

def main():
    """Main function to run the International Number Tracker application."""
    print("🌍 International Number Tracker")
    print("=" * 40)
    
    tracker = InternationalNumberTracker()
    
    while True:
        print("\nOptions:")
        print("1. Validate and track a phone number")
        print("2. View all tracked numbers")
        print("3. Search tracked numbers")
        print("4. Delete a tracked number")
        print("5. Get phone number information")
        print("6. Exit")
        
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice == "1":
            phone_number = input("Enter international phone number (e.g., +2348012345678 or +12125551234): ").strip()
            notes = input("Enter notes (optional): ").strip()
            
            if tracker.validate_international_number(phone_number):
                if tracker.track_phone_number(phone_number, notes):
                    print(f"✅ Phone number {phone_number} tracked successfully!")
                else:
                    print("❌ Failed to track phone number.")
            else:
                print("❌ Invalid international phone number.")
        
        elif choice == "2":
            numbers = tracker.get_tracked_numbers()
            if numbers:
                print("\n📱 Tracked Phone Numbers:")
                print("-" * 80)
                for num in numbers:
                    print(f"📞 {num['phone_number']}")
                    print(f"   Carrier: {num['carrier']}")
                    print(f"   Type: {num['phone_type']}")
                    print(f"   Added: {num['date_added']}")
                    if num['notes']:
                        print(f"   Notes: {num['notes']}")
                    print("-" * 80)
            else:
                print("No tracked numbers found.")
        
        elif choice == "3":
            query = input("Enter search query: ").strip()
            results = tracker.search_numbers(query)
            if results:
                print(f"\n🔍 Search Results ({len(results)} found):")
                print("-" * 80)
                for result in results:
                    print(f"📞 {result['phone_number']}")
                    print(f"   Carrier: {result['carrier']}")
                    print(f"   Type: {result['phone_type']}")
                    print("-" * 80)
            else:
                print("No matching numbers found.")
        
        elif choice == "4":
            phone_number = input("Enter phone number to delete: ").strip()
            if tracker.delete_tracked_number(phone_number):
                print(f"✅ Phone number {phone_number} deleted successfully!")
            else:
                print("❌ Phone number not found or deletion failed.")
        
        elif choice == "5":
            phone_number = input("Enter phone number to analyze: ").strip()
            info = tracker.get_phone_info(phone_number)
            
            print("\n📊 Phone Number Information:")
            print("-" * 50)
            for key, value in info.items():
                if key != 'error':
                    print(f"{key.replace('_', ' ').title()}: {value}")
            if 'error' in info:
                print(f"Error: {info['error']}")
        
        elif choice == "6":
            print("👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
