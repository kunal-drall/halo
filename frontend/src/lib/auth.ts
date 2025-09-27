// Temporary placeholder for authentication - to be replaced with Privy integration
export const useAuth = () => ({
  authenticated: true, // Set to true for demo purposes
  login: () => alert('Authentication will be integrated with Privy'),
  logout: () => {},
  user: {
    id: 'demo-user',
    email: 'demo@example.com',
    wallet: {
      address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
    }
  }
})