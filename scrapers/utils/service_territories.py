"""Service territory mappings for Tennessee utilities."""

# Mapping of utilities to the counties they serve
SERVICE_TERRITORIES = {
    'Nashville Electric Service': ['Davidson'],
    'Memphis Light, Gas & Water': ['Shelby'],
    'EPB Chattanooga': ['Hamilton'],
    'Knoxville Utilities Board': ['Knox'],
    # TODO: Add cooperative mappings
    # 'Middle Tennessee Electric': ['Wilson', 'Rutherford', 'Williamson', 'Sumner', 'Cannon', 'DeKalb', 'Smith', 'Trousdale', 'Macon'],
    # ... more cooperatives
}

# All 95 Tennessee counties
TN_COUNTIES = [
    'Anderson', 'Bedford', 'Benton', 'Bledsoe', 'Blount', 'Bradley', 'Campbell',
    'Cannon', 'Carroll', 'Carter', 'Cheatham', 'Chester', 'Claiborne', 'Clay',
    'Cocke', 'Coffee', 'Crockett', 'Cumberland', 'Davidson', 'Decatur', 'DeKalb',
    'Dickson', 'Dyer', 'Fayette', 'Fentress', 'Franklin', 'Gibson', 'Giles',
    'Grainger', 'Greene', 'Grundy', 'Hamblen', 'Hamilton', 'Hancock', 'Hardeman',
    'Hardin', 'Hawkins', 'Haywood', 'Henderson', 'Henry', 'Hickman', 'Houston',
    'Humphreys', 'Jackson', 'Jefferson', 'Johnson', 'Knox', 'Lake', 'Lauderdale',
    'Lawrence', 'Lewis', 'Lincoln', 'Loudon', 'Macon', 'Madison', 'Marion',
    'Marshall', 'Maury', 'McMinn', 'McNairy', 'Meigs', 'Monroe', 'Montgomery',
    'Moore', 'Morgan', 'Obion', 'Overton', 'Perry', 'Pickett', 'Polk', 'Putnam',
    'Rhea', 'Roane', 'Robertson', 'Rutherford', 'Scott', 'Sequatchie', 'Sevier',
    'Shelby', 'Smith', 'Stewart', 'Sullivan', 'Sumner', 'Tipton', 'Trousdale',
    'Unicoi', 'Union', 'Van Buren', 'Warren', 'Washington', 'Wayne', 'Weakley',
    'White', 'Williamson', 'Wilson'
]
