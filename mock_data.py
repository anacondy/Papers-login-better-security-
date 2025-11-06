"""
Mock data for development and testing
Replace with actual database queries in production
"""

# Mock papers database
MOCK_PAPERS = [
    {
        'class': 'MCA',
        'subject': 'Data Structures',
        'semester': 1,
        'exam_year': 2024,
        'url': '#'
    },
    {
        'class': 'MCA',
        'subject': 'Computer Networks',
        'semester': 2,
        'exam_year': 2023,
        'url': '#'
    },
    {
        'class': 'BCA',
        'subject': 'Programming in C',
        'semester': 1,
        'exam_year': 2024,
        'url': '#'
    },
    {
        'class': 'BSc',
        'subject': 'Physics',
        'semester': 1,
        'exam_year': 2024,
        'url': '#'
    },
    {
        'class': 'BSc',
        'subject': 'Chemistry',
        'semester': 2,
        'exam_year': 2023,
        'url': '#'
    },
    {
        'class': 'BA',
        'subject': 'English Literature',
        'semester': 1,
        'exam_year': 2024,
        'url': '#'
    },
    {
        'class': 'BA',
        'subject': 'History',
        'semester': 3,
        'exam_year': 2022,
        'url': '#'
    },
    {
        'class': 'MCA',
        'subject': 'Database Management',
        'semester': 3,
        'exam_year': 2023,
        'url': '#'
    }
]

def get_all_papers():
    """Get all papers from mock database"""
    return MOCK_PAPERS.copy()

def search_papers(query):
    """
    Search papers by query string
    
    Args:
        query (str): Search query (case-insensitive)
    
    Returns:
        list: Filtered papers matching the query
    """
    if not query:
        return MOCK_PAPERS.copy()
    
    query_lower = query.lower()
    return [
        p for p in MOCK_PAPERS 
        if query_lower in p['subject'].lower() 
        or query_lower in p['class'].lower()
        or query_lower in str(p['exam_year'])
    ]
