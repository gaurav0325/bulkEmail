// Netlify Function for user login
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
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
        const { email, password, rememberMe = true } = JSON.parse(event.body);

        // Validate input
        if (!email || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Email and password are required'
                })
            };
        }

        // Attempt to sign in with Supabase
        console.log('Login attempt for email:', email.toLowerCase());

        let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password: password
        });

        console.log('Supabase auth response:', {
            user: authData?.user ? 'User found' : 'No user',
            userConfirmed: authData?.user?.email_confirmed_at ? 'Confirmed' : 'Not confirmed',
            error: authError ? authError.message : 'No error'
        });

        if (authError) {
            console.error('Supabase auth error details:', authError);

            // Check if it's an email confirmation issue
            if (authError.message?.includes('Email not confirmed') || authError.message?.includes('email_confirmed_at')) {
                // Try to auto-confirm the user if they exist but aren't confirmed
                const { data: userData } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', email.toLowerCase())
                    .single();

                if (userData) {
                    console.log('Found user, attempting auto-confirmation...');
                    const { error: confirmError } = await supabase.auth.admin.updateUserById(
                        userData.id,
                        { email_confirm: true }
                    );

                    if (!confirmError) {
                        console.log('Auto-confirmation successful, retrying login...');
                        // Retry the login after confirmation
                        const { data: retryAuthData, error: retryAuthError } = await supabase.auth.signInWithPassword({
                            email: email.toLowerCase(),
                            password: password
                        });

                        if (!retryAuthError && retryAuthData.user) {
                            authData = retryAuthData;
                            authError = null;
                            console.log('Retry login successful');
                        } else {
                            console.error('Retry login failed:', retryAuthError);
                        }
                    }
                }
            }
        }

        if (authError || !authData.user) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    error: 'Invalid email or password'
                })
            };
        }

        // Get user profile data
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError || !userProfile) {
            console.error('Profile fetch error:', profileError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Failed to fetch user profile'
                })
            };
        }

        // Update last login timestamp
        await supabase
            .from('users')
            .update({
                last_login: new Date().toISOString()
            })
            .eq('id', authData.user.id);

        // Get user's companies and data
        const { data: companies } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', authData.user.id)
            .order('created_at', { ascending: false });

        const { data: contacts } = await supabase
            .from('contacts')
            .select('*')
            .eq('user_id', authData.user.id)
            .order('created_at', { ascending: false });

        const { data: emailHistory } = await supabase
            .from('email_history')
            .select('*')
            .eq('user_id', authData.user.id)
            .order('timestamp', { ascending: false });

        // Create session token (JWT)
        const sessionToken = authData.session.access_token;
        const expiresAt = rememberMe
            ? Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
            : Date.now() + (24 * 60 * 60 * 1000); // 24 hours

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Login successful',
                user: {
                    id: userProfile.id,
                    email: userProfile.email,
                    fullName: userProfile.full_name,
                    isVerified: userProfile.is_verified,
                    lastLogin: userProfile.last_login,
                    profileData: userProfile.profile_data || {}
                },
                session: {
                    token: sessionToken,
                    expiresAt: expiresAt,
                    rememberMe: rememberMe
                },
                userData: {
                    companies: companies || [],
                    contacts: contacts || [],
                    emailHistory: emailHistory || []
                }
            })
        };

    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error during login'
            })
        };
    }
};