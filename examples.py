#!/usr/bin/env python3
"""
Example usage of the International Number Tracker
"""

from app import InternationalNumberTracker

def main():
    """Demonstrate various features of the phone tracker."""
    
    # Initialize the tracker
    tracker = InternationalNumberTracker()
    
    print("🌍 International Number Tracker - Examples")
    print("=" * 50)
    
    # Example phone numbers
    test_numbers = [
        "+2348012345678",  # Nigeria - MTN
        "+12125551234",   # USA
        "+442071838750",  # UK
        "+919876543210",  # India
        "+81312345678",   # Japan
        "+12345678",      # Invalid (too short)
    ]
    
    print("\n1. Phone Number Validation Examples:")
    print("-" * 40)
    for number in test_numbers:
        is_valid = tracker.validate_international_number(number)
        status = "✅ Valid" if is_valid else "❌ Invalid"
        print(f"{number}: {status}")
    
    print("\n2. Detailed Phone Number Information:")
    print("-" * 40)
    for number in test_numbers[:5]:  # Show details for valid numbers only
        if tracker.validate_international_number(number):
            info = tracker.get_phone_info(number)
            print(f"\n📞 {number}")
            print(f"   Carrier: {info['carrier']}")
            print(f"   Type: {info['phone_type']}")
            print(f"   Region: {info['region']}")
            print(f"   Location: {info['location']}")
            print(f"   Timezone: {info['timezone']}")
    
    print("\n3. Tracking Phone Numbers:")
    print("-" * 40)
    
    # Track some example numbers
    example_tracks = [
        ("+2348012345678", "Business contact - Nigeria"),
        ("+12125551234", "Business contact - USA"),
        ("+442071838750", "Business contact - UK"),
    ]
    
    for number, notes in example_tracks:
        success = tracker.track_phone_number(number, notes)
        status = "✅ Tracked" if success else "❌ Failed"
        print(f"{number}: {status}")
    
    print("\n4. Searching Tracked Numbers:")
    print("-" * 40)
    
    # Search for different terms
    search_terms = ["business", "MTN", "contact"]
    for term in search_terms:
        results = tracker.search_numbers(term)
        print(f"Search '{term}': {len(results)} results")
        for result in results:
            print(f"   - {result['phone_number']} ({result['notes']})")
    
    print("\n5. All Tracked Numbers:")
    print("-" * 40)
    tracked_numbers = tracker.get_tracked_numbers()
    for num in tracked_numbers:
        print(f"📞 {num['phone_number']}")
        print(f"   Carrier: {num['carrier']}")
        print(f"   Notes: {num['notes']}")
        print(f"   Added: {num['date_added']}")
        print()

if __name__ == "__main__":
    main()
