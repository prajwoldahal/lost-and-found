// Mock Data for Lost and Found Community App
// This replaces Firebase backend for frontend-only demo

// Mock Users
export const mockUsers = [
    {
        id: 'user1',
        email: 'prajwal@example.com',
        displayName: 'Prajwal Dahal',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prajwal',
        bio: 'Developer and community helper passionate about reuniting lost items',
        phone: '+977-9800000000',
        points: 850,
        rank: 1,
        postsCount: 12,
        claimsCount: 8,
        isAdmin: false,
        isVerified: true,
        createdAt: '2024-01-15'
    },
    {
        id: 'user2',
        email: 'jane.smith@example.com',
        displayName: 'Jane Smith',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        bio: 'Community helper and lost item finder',
        phone: '+1234567891',
        points: 720,
        rank: 2,
        postsCount: 10,
        claimsCount: 6,
        isAdmin: false,
        isVerified: false,
        createdAt: '2024-02-01'
    },
    {
        id: 'user3',
        email: 'mike.wilson@example.com',
        displayName: 'Mike Wilson',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        bio: 'Always on the lookout for lost items',
        phone: '+1234567892',
        points: 650,
        rank: 3,
        postsCount: 8,
        claimsCount: 7,
        isAdmin: false,
        isVerified: true,
        createdAt: '2024-02-15'
    },
    {
        id: 'user4',
        email: 'sarah.johnson@example.com',
        displayName: 'Sarah Johnson',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        bio: 'Passionate about helping others',
        phone: '+1234567893',
        points: 580,
        rank: 4,
        postsCount: 7,
        claimsCount: 5,
        isAdmin: false,
        isVerified: false,
        createdAt: '2024-03-01'
    },
    {
        id: 'user5',
        email: 'admin@lostandfound.com',
        displayName: 'Admin User',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        bio: 'System Administrator',
        phone: '+1234567894',
        points: 1000,
        rank: 0,
        postsCount: 5,
        claimsCount: 3,
        isAdmin: true,
        isVerified: true,
        createdAt: '2024-01-01'
    }
];

// Mock Lost and Found Items
export const mockItems = [
    {
        id: 'item1',
        title: 'Black Leather Wallet',
        description: 'Lost my black leather wallet near Central Park. Contains ID and credit cards. Reward offered.',
        type: 'lost',
        category: 'Wallet',
        status: 'active',
        date: '2024-12-18',
        location: { lat: 27.7172, lng: 85.3240 },
        locationName: 'Kathmandu, Nepal',
        imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
        createdBy: 'user1',
        creatorName: 'Prajwal Dahal',
        creatorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prajwal',
        createdAt: '2024-12-18T10:30:00Z',
        views: 45,
        claimedBy: null
    },
    {
        id: 'item2',
        title: 'iPhone 13 Pro',
        description: 'Found an iPhone 13 Pro in blue color at the coffee shop on Main Street. Has a cracked screen protector.',
        type: 'found',
        category: 'Electronics',
        status: 'active',
        date: '2024-12-19',
        location: { lat: 27.7089, lng: 85.3206 },
        locationName: 'Thamel, Kathmandu',
        imageUrl: 'https://images.unsplash.com/photo-1592286927505-b0501e6c0d93?w=400',
        createdBy: 'user2',
        creatorName: 'Jane Smith',
        creatorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        createdAt: '2024-12-19T14:20:00Z',
        views: 67,
        claimedBy: null
    },
    {
        id: 'item3',
        title: 'Golden Retriever Dog',
        description: 'Lost my golden retriever named Max. Very friendly, wearing a red collar with tags. Please help!',
        type: 'lost',
        category: 'Pets',
        status: 'claimed',
        date: '2024-12-15',
        location: { lat: 27.6915, lng: 85.3157 },
        locationName: 'Patan, Lalitpur',
        imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400',
        createdBy: 'user3',
        creatorName: 'Mike Wilson',
        creatorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        createdAt: '2024-12-15T09:15:00Z',
        views: 123,
        claimedBy: 'user2',
        claimedAt: '2024-12-16T11:30:00Z'
    },
    {
        id: 'item4',
        title: 'Blue Backpack with Laptop',
        description: 'Found a blue backpack containing a laptop and some books at the bus station.',
        type: 'found',
        category: 'Bags',
        status: 'active',
        date: '2024-12-20',
        location: { lat: 27.7025, lng: 85.3156 },
        locationName: 'Ratna Park, Kathmandu',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        createdBy: 'user4',
        creatorName: 'Sarah Johnson',
        creatorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        createdAt: '2024-12-20T08:45:00Z',
        views: 34,
        claimedBy: null
    },
    {
        id: 'item5',
        title: 'Car Keys with BMW Keychain',
        description: 'Lost my car keys with a BMW keychain near the shopping mall parking lot.',
        type: 'lost',
        category: 'Keys',
        status: 'active',
        date: '2024-12-19',
        location: { lat: 27.6993, lng: 85.3218 },
        locationName: 'New Road, Kathmandu',
        imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400',
        createdBy: 'user1',
        creatorName: 'Prajwal Dahal',
        creatorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prajwal',
        createdAt: '2024-12-19T16:00:00Z',
        views: 28,
        claimedBy: null
    },
    {
        id: 'item6',
        title: 'Silver Watch - Citizen Brand',
        description: 'Found a silver Citizen watch at the gym locker room. Looks expensive.',
        type: 'found',
        category: 'Accessories',
        status: 'returned',
        date: '2024-12-10',
        location: { lat: 27.7103, lng: 85.3222 },
        locationName: 'Durbarmarg, Kathmandu',
        imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
        createdBy: 'user2',
        creatorName: 'Jane Smith',
        creatorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        createdAt: '2024-12-10T12:00:00Z',
        views: 89,
        claimedBy: 'user3',
        claimedAt: '2024-12-11T10:00:00Z',
        returnedAt: '2024-12-12T14:00:00Z'
    },
    {
        id: 'item7',
        title: 'Red Bicycle - Mountain Bike',
        description: 'Lost my red mountain bike near the university campus. Has a small dent on the frame.',
        type: 'lost',
        category: 'Vehicles',
        status: 'active',
        date: '2024-12-17',
        location: { lat: 27.6810, lng: 85.3200 },
        locationName: 'Pulchowk, Lalitpur',
        imageUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
        createdBy: 'user4',
        creatorName: 'Sarah Johnson',
        creatorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        createdAt: '2024-12-17T07:30:00Z',
        views: 52,
        claimedBy: null
    },
    {
        id: 'item8',
        title: 'Prescription Glasses in Black Case',
        description: 'Found prescription glasses in a black case at the library reading room.',
        type: 'found',
        category: 'Accessories',
        status: 'active',
        date: '2024-12-20',
        location: { lat: 27.7172, lng: 85.3140 },
        locationName: 'Keshar Mahal, Kathmandu',
        imageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
        createdBy: 'user3',
        creatorName: 'Mike Wilson',
        creatorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        createdAt: '2024-12-20T15:20:00Z',
        views: 19,
        claimedBy: null
    }
];

// Mock Messages/Conversations
export const mockConversations = [
    {
        id: 'conv1',
        postId: 'item1',
        postTitle: 'Black Leather Wallet',
        participants: ['user1', 'user2'],
        participantDetails: {
            user2: {
                name: 'Jane Smith',
                photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
            }
        },
        lastMessage: 'I think I saw it near the fountain. Let me check.',
        lastMessageTime: '2024-12-20T10:30:00Z',
        unreadCount: 2,
        messages: [
            {
                id: 'msg1',
                senderId: 'user1',
                text: 'Hi, did you find any wallet near Central Park?',
                timestamp: '2024-12-20T09:00:00Z',
                read: true
            },
            {
                id: 'msg2',
                senderId: 'user2',
                text: 'Hello! I haven\'t found it yet, but I\'ll keep an eye out.',
                timestamp: '2024-12-20T09:15:00Z',
                read: true
            },
            {
                id: 'msg3',
                senderId: 'user1',
                text: 'Thank you so much! It has my ID and credit cards.',
                timestamp: '2024-12-20T09:20:00Z',
                read: true
            },
            {
                id: 'msg4',
                senderId: 'user2',
                text: 'I think I saw it near the fountain. Let me check.',
                timestamp: '2024-12-20T10:30:00Z',
                read: false
            }
        ]
    },
    {
        id: 'conv2',
        postId: 'item2',
        postTitle: 'iPhone 13 Pro',
        participants: ['user2', 'user3'],
        participantDetails: {
            user3: {
                name: 'Mike Wilson',
                photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
            }
        },
        lastMessage: 'Yes, that\'s mine! When can we meet?',
        lastMessageTime: '2024-12-20T11:00:00Z',
        unreadCount: 1,
        messages: [
            {
                id: 'msg5',
                senderId: 'user3',
                text: 'Hi! I lost my iPhone yesterday. Is it blue with a cracked screen protector?',
                timestamp: '2024-12-20T10:00:00Z',
                read: true
            },
            {
                id: 'msg6',
                senderId: 'user2',
                text: 'Yes! That matches the description. Can you tell me what\'s on the lock screen?',
                timestamp: '2024-12-20T10:15:00Z',
                read: true
            },
            {
                id: 'msg7',
                senderId: 'user3',
                text: 'It\'s a photo of a mountain landscape.',
                timestamp: '2024-12-20T10:45:00Z',
                read: true
            },
            {
                id: 'msg8',
                senderId: 'user3',
                text: 'Yes, that\'s mine! When can we meet?',
                timestamp: '2024-12-20T11:00:00Z',
                read: false
            }
        ]
    },
    {
        id: 'conv3',
        postId: 'item4',
        postTitle: 'Blue Backpack with Laptop',
        participants: ['user4', 'user1'],
        participantDetails: {
            user1: {
                name: 'John Doe',
                photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
            }
        },
        lastMessage: 'Great! I\'ll be there at 3 PM.',
        lastMessageTime: '2024-12-20T12:00:00Z',
        unreadCount: 0,
        messages: [
            {
                id: 'msg9',
                senderId: 'user1',
                text: 'I think this might be my backpack! Does it have a laptop inside?',
                timestamp: '2024-12-20T11:00:00Z',
                read: true
            },
            {
                id: 'msg10',
                senderId: 'user4',
                text: 'Yes, it does. Can you describe the laptop brand?',
                timestamp: '2024-12-20T11:15:00Z',
                read: true
            },
            {
                id: 'msg11',
                senderId: 'user1',
                text: 'It\'s a Dell XPS 15 with a sticker on the back.',
                timestamp: '2024-12-20T11:30:00Z',
                read: true
            },
            {
                id: 'msg12',
                senderId: 'user4',
                text: 'Perfect! Let\'s meet at the bus station tomorrow at 3 PM?',
                timestamp: '2024-12-20T11:45:00Z',
                read: true
            },
            {
                id: 'msg13',
                senderId: 'user1',
                text: 'Great! I\'ll be there at 3 PM.',
                timestamp: '2024-12-20T12:00:00Z',
                read: true
            }
        ]
    }
];

// Mock Leaderboard Data
export const mockLeaderboard = {
    allTime: [
        { userId: 'user1', name: 'Prajwal Dahal', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prajwal', points: 850, rank: 1, postsCount: 12, claimsCount: 8 },
        { userId: 'user2', name: 'Jane Smith', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', points: 720, rank: 2, postsCount: 10, claimsCount: 6 },
        { userId: 'user3', name: 'Mike Wilson', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', points: 650, rank: 3, postsCount: 8, claimsCount: 7 },
        { userId: 'user4', name: 'Sarah Johnson', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', points: 580, rank: 4, postsCount: 7, claimsCount: 5 },
        { userId: 'user5', name: 'Admin User', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', points: 1000, rank: 5, postsCount: 5, claimsCount: 3 }
    ],
    thisMonth: [
        { userId: 'user2', name: 'Jane Smith', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', points: 320, rank: 1, postsCount: 4, claimsCount: 3 },
        { userId: 'user1', name: 'Prajwal Dahal', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prajwal', points: 280, rank: 2, postsCount: 3, claimsCount: 2 },
        { userId: 'user4', name: 'Sarah Johnson', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', points: 250, rank: 3, postsCount: 3, claimsCount: 2 },
        { userId: 'user3', name: 'Mike Wilson', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', points: 210, rank: 4, postsCount: 2, claimsCount: 2 }
    ],
    thisWeek: [
        { userId: 'user4', name: 'Sarah Johnson', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', points: 150, rank: 1, postsCount: 2, claimsCount: 1 },
        { userId: 'user3', name: 'Mike Wilson', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', points: 120, rank: 2, postsCount: 1, claimsCount: 1 },
        { userId: 'user2', name: 'Jane Smith', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', points: 100, rank: 3, postsCount: 1, claimsCount: 1 },
        { userId: 'user1', name: 'Prajwal Dahal', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prajwal', points: 80, rank: 4, postsCount: 1, claimsCount: 0 }
    ]
};

// Mock Claim History
export const mockClaimHistory = [
    {
        id: 'claim1',
        itemId: 'item3',
        itemTitle: 'Golden Retriever Dog',
        itemType: 'lost',
        claimedBy: 'user2',
        claimerName: 'Jane Smith',
        ownerId: 'user3',
        ownerName: 'Mike Wilson',
        claimedAt: '2024-12-16T11:30:00Z',
        status: 'returned',
        returnedAt: '2024-12-16T15:00:00Z',
        pointsEarned: 100
    },
    {
        id: 'claim2',
        itemId: 'item6',
        itemTitle: 'Silver Watch - Citizen Brand',
        itemType: 'found',
        claimedBy: 'user3',
        claimerName: 'Mike Wilson',
        ownerId: 'user2',
        ownerName: 'Jane Smith',
        claimedAt: '2024-12-11T10:00:00Z',
        status: 'returned',
        returnedAt: '2024-12-12T14:00:00Z',
        pointsEarned: 80
    }
];

// Mock Chat Requests
export let mockChatRequests = [
    {
        id: 'req1',
        senderId: 'user2',
        senderName: 'Jane Smith',
        senderPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        receiverId: 'user1',
        postId: 'item1',
        postTitle: 'Black Leather Wallet',
        status: 'pending',
        createdAt: '2024-12-21T09:00:00Z'
    },
    {
        id: 'req2',
        senderId: 'user3',
        senderName: 'Mike Wilson',
        senderPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        receiverId: 'user1',
        postId: 'item5',
        postTitle: 'Car Keys with BMW Keychain',
        status: 'accepted',
        createdAt: '2024-12-21T10:00:00Z'
    }
];

// Helper function to get chat requests for a user (as receiver)
export const getChatRequestsForUser = (userId) => {
    return mockChatRequests.filter(req => req.receiverId === userId);
};

// Helper function to get chat requests by sender and post
export const getChatRequestBySenderAndPost = (senderId, postId) => {
    return mockChatRequests.find(req => req.senderId === senderId && req.postId === postId);
};

// Helper function to send a new chat request
export const sendChatRequest = (requestData) => {
    const newRequest = {
        id: `req${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...requestData
    };
    mockChatRequests.push(newRequest);
    return newRequest;
};

// Helper function to update chat request status
export const updateChatRequestStatus = (requestId, status) => {
    const request = mockChatRequests.find(req => req.id === requestId);
    if (request) {
        request.status = status;

        // If accepted, we could also initialize a conversation here in a real app
        if (status === 'accepted') {
            const conversationExists = mockConversations.find(conv =>
                conv.postId === request.postId &&
                conv.participants.includes(request.senderId) &&
                conv.participants.includes(request.receiverId)
            );

            if (!conversationExists) {
                mockConversations.push({
                    id: `conv${Date.now()}`,
                    postId: request.postId,
                    postTitle: request.postTitle,
                    participants: [request.senderId, request.receiverId],
                    participantDetails: {
                        [request.senderId]: {
                            name: request.senderName,
                            photo: request.senderPhoto
                        },
                        [request.receiverId]: {
                            name: 'Prajwal Dahal', // Mock current user
                            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prajwal'
                        }
                    },
                    lastMessage: 'Chat request accepted. You can now start messaging!',
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: 0,
                    messages: []
                });
            }
        }
    }
    return request;
};

// Helper function to get user by ID
export const getUserById = (userId) => {
    return mockUsers.find(user => user.id === userId);
};

// Helper function to get items by user
export const getItemsByUser = (userId) => {
    return mockItems.filter(item => item.createdBy === userId);
};

// Helper function to get conversations by user
export const getConversationsByUser = (userId) => {
    return mockConversations.filter(conv => conv.participants.includes(userId));
};

// Helper function to get claim history by user
export const getClaimHistoryByUser = (userId) => {
    return mockClaimHistory.filter(claim => claim.claimedBy === userId || claim.ownerId === userId);
};

// Default logged-in user (for demo purposes)
export const defaultUser = mockUsers[0]; // John Doe
