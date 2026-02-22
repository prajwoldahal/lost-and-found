// Admin Mock Data for Lost and Found Community App
// This is for demonstration purposes only - frontend mockup

export const adminUsers = [
    {
        id: 'admin1',
        email: 'admin@lostandfound.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'super_admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=1E3A8A&color=fff'
    }
];

export const adminStats = {
    totalUsers: 1247,
    totalPosts: 856,
    lostItems: 512,
    foundItems: 344,
    flaggedPosts: 23,
    activeUsers: 892,
    resolvedCases: 234,
    avgResponseTime: '2.5 hours',
    newUsersToday: 12,
    newPostsToday: 28
};

export const mockReports = [
    {
        id: 'report1',
        type: 'post',
        reportedItemId: 'item1',
        reportedItemTitle: 'Lost iPhone 13 Pro',
        reporterName: 'John Doe',
        reporterEmail: 'john@example.com',
        reason: 'Spam/Scam',
        description: 'This post appears to be a scam. The contact information looks suspicious.',
        status: 'pending',
        priority: 'high',
        createdAt: '2024-12-20T10:30:00',
        evidence: null
    },
    {
        id: 'report2',
        type: 'user',
        reportedUserId: 'user123',
        reportedUserName: 'Suspicious User',
        reporterName: 'Jane Smith',
        reporterEmail: 'jane@example.com',
        reason: 'Inappropriate Behavior',
        description: 'User is sending harassing messages through the chat system.',
        status: 'pending',
        priority: 'high',
        createdAt: '2024-12-19T15:45:00',
        evidence: null
    },
    {
        id: 'report3',
        type: 'post',
        reportedItemId: 'item2',
        reportedItemTitle: 'Found Wallet',
        reporterName: 'Mike Johnson',
        reporterEmail: 'mike@example.com',
        reason: 'Duplicate Post',
        description: 'This item has been posted multiple times by the same user.',
        status: 'reviewed',
        priority: 'low',
        createdAt: '2024-12-18T09:20:00',
        evidence: null
    }
];

export const mockUsers = [
    {
        id: 'user1',
        name: 'Prajwal Dahal',
        email: 'prajwal@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Prajwal+Dahal&background=3B82F6&color=fff',
        joinDate: '2024-11-15',
        status: 'active',
        postsCreated: 5,
        itemsClaimed: 2,
        rewardPoints: 150,
        lastActive: '2024-12-21T09:00:00'
    },
    {
        id: 'user2',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=10B981&color=fff',
        joinDate: '2024-10-20',
        status: 'active',
        postsCreated: 12,
        itemsClaimed: 7,
        rewardPoints: 420,
        lastActive: '2024-12-20T18:30:00'
    },
    {
        id: 'user3',
        name: 'Michael Chen',
        email: 'michael@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=F59E0B&color=fff',
        joinDate: '2024-09-05',
        status: 'active',
        postsCreated: 8,
        itemsClaimed: 3,
        rewardPoints: 280,
        lastActive: '2024-12-21T07:15:00'
    },
    {
        id: 'user4',
        name: 'Emily Rodriguez',
        email: 'emily@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=EF4444&color=fff',
        joinDate: '2024-12-01',
        status: 'suspended',
        postsCreated: 3,
        itemsClaimed: 0,
        rewardPoints: 30,
        lastActive: '2024-12-15T12:00:00'
    },
    {
        id: 'user5',
        name: 'David Kim',
        email: 'david@example.com',
        avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=8B5CF6&color=fff',
        joinDate: '2024-08-12',
        status: 'active',
        postsCreated: 15,
        itemsClaimed: 10,
        rewardPoints: 650,
        lastActive: '2024-12-20T22:45:00'
    }
];

export const mockCategories = [
    { id: 'cat1', name: 'Electronics', icon: '📱', itemCount: 245, active: true },
    { id: 'cat2', name: 'Documents', icon: '📄', itemCount: 189, active: true },
    { id: 'cat3', name: 'Accessories', icon: '👜', itemCount: 156, active: true },
    { id: 'cat4', name: 'Pets', icon: '🐾', itemCount: 78, active: true },
    { id: 'cat5', name: 'Clothing', icon: '👕', itemCount: 92, active: true },
    { id: 'cat6', name: 'Keys', icon: '🔑', itemCount: 134, active: true },
    { id: 'cat7', name: 'Bags', icon: '🎒', itemCount: 67, active: true },
    { id: 'cat8', name: 'Jewelry', icon: '💍', itemCount: 43, active: true },
    { id: 'cat9', name: 'Books', icon: '📚', itemCount: 56, active: true },
    { id: 'cat10', name: 'Other', icon: '📦', itemCount: 96, active: true }
];

export const mockLocations = [
    { id: 'loc1', name: 'Kathmandu', region: 'Central', popular: true, itemCount: 342 },
    { id: 'loc2', name: 'Pokhara', region: 'Western', popular: true, itemCount: 178 },
    { id: 'loc3', name: 'Lalitpur', region: 'Central', popular: true, itemCount: 156 },
    { id: 'loc4', name: 'Bhaktapur', region: 'Central', popular: false, itemCount: 89 },
    { id: 'loc5', name: 'Biratnagar', region: 'Eastern', popular: false, itemCount: 67 },
    { id: 'loc6', name: 'Birgunj', region: 'Central', popular: false, itemCount: 45 },
    { id: 'loc7', name: 'Dharan', region: 'Eastern', popular: false, itemCount: 34 },
    { id: 'loc8', name: 'Butwal', region: 'Western', popular: false, itemCount: 28 }
];

export const recentActivities = [
    {
        id: 'act1',
        type: 'new_user',
        user: 'Alex Thompson',
        action: 'registered',
        timestamp: '2024-12-21T09:45:00',
        icon: '👤'
    },
    {
        id: 'act2',
        type: 'new_post',
        user: 'Sarah Wilson',
        action: 'posted a found item',
        details: 'Found Laptop - Dell XPS',
        timestamp: '2024-12-21T09:30:00',
        icon: '📝'
    },
    {
        id: 'act3',
        type: 'claim',
        user: 'Michael Chen',
        action: 'claimed an item',
        details: 'Lost Wallet',
        timestamp: '2024-12-21T09:15:00',
        icon: '✅'
    },
    {
        id: 'act4',
        type: 'report',
        user: 'John Doe',
        action: 'reported a post',
        details: 'Spam content',
        timestamp: '2024-12-21T09:00:00',
        icon: '🚩'
    },
    {
        id: 'act5',
        type: 'resolved',
        user: 'David Kim',
        action: 'marked item as returned',
        details: 'Found Keys',
        timestamp: '2024-12-21T08:45:00',
        icon: '🎉'
    }
];

export const adminMockPosts = [
    {
        id: 'post1',
        title: 'Lost iPhone 13 Pro',
        type: 'lost',
        category: 'Electronics',
        location: 'Kathmandu',
        creatorName: 'Prajwal Dahal',
        creatorId: 'user1',
        status: 'active',
        date: '2024-12-20',
        views: 145,
        flagged: false,
        imageUrl: 'https://images.unsplash.com/photo-1592286927505-c0d6b5e1b5f5?w=400'
    },
    {
        id: 'post2',
        title: 'Found Wallet with ID Cards',
        type: 'found',
        category: 'Documents',
        location: 'Pokhara',
        creatorName: 'Sarah Wilson',
        creatorId: 'user2',
        status: 'active',
        date: '2024-12-19',
        views: 89,
        flagged: false,
        imageUrl: 'https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?w=400'
    },
    {
        id: 'post3',
        title: 'Lost Car Keys - Toyota',
        type: 'lost',
        category: 'Keys',
        location: 'Lalitpur',
        creatorName: 'Michael Chen',
        creatorId: 'user3',
        status: 'claimed',
        date: '2024-12-18',
        views: 234,
        flagged: false,
        imageUrl: null
    },
    {
        id: 'post4',
        title: 'Suspicious Post - Fake Item',
        type: 'lost',
        category: 'Electronics',
        location: 'Kathmandu',
        creatorName: 'Suspicious User',
        creatorId: 'user4',
        status: 'active',
        date: '2024-12-20',
        views: 12,
        flagged: true,
        imageUrl: null
    },
    {
        id: 'post5',
        title: 'Found Laptop - Dell XPS',
        type: 'found',
        category: 'Electronics',
        location: 'Kathmandu',
        creatorName: 'David Kim',
        creatorId: 'user5',
        status: 'returned',
        date: '2024-12-17',
        views: 456,
        flagged: false,
        imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400'
    }
];
