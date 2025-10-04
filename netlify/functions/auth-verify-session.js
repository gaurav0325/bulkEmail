// Netlify Function for session verification
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { token } = JSON.parse(event.body);

        if (!token) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Session token is required' })
            };
        }

        // Verify the session token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    error: 'Invalid or expired session token'
                })
            };
        }

        // Get user profile data
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !userProfile) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'User profile not found'
                })
            };
        }

        // Get user's data
        const { data: companies } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        const { data: contacts } = await supabase
            .from('contacts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        const { data: emailHistory } = await supabase
            .from('email_history')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                user: {
                    id: userProfile.id,
                    email: userProfile.email,
                    fullName: userProfile.full_name,
                    isVerified: userProfile.is_verified,
                    lastLogin: userProfile.last_login,
                    profileData: userProfile.profile_data || {}
                },
                userData: {
                    companies: companies || [],
                    contacts: contacts || [],
                    emailHistory: emailHistory || []
                }
            })
        };

    } catch (error) {
        console.error('Session verification error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error during session verification'
            })
        };
    }
};