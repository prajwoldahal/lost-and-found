import axios from 'axios';

async function testBackend() {
    try {
        console.log('Testing backend health...');
        const health = await axios.get('http://localhost:5000/health');
        console.log('Health:', health.data);

        console.log('Testing leaderboard...');
        const leaderboard = await axios.get('http://localhost:5000/api/users/leaderboard');
        console.log('Leaderboard count:', leaderboard.data.length);

        console.log('Testing posts...');
        const posts = await axios.get('http://localhost:5000/api/posts');
        console.log('Posts count:', posts.data.length);
    } catch (error) {
        console.error('Backend test failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testBackend();
