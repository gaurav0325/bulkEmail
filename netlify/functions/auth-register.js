// Netlify Function for user registration
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
        const { email, password, fullName } = JSON.parse(event.body);

        // Validate input
        if (!email || !password || !fullName) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required fields: email, password, fullName'
                })
            };
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid email format' })
            };
        }

        // Password validation
        if (password.length < 8) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Password must be at least 8 characters long'
                })
            };
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    error: 'An account with this email already exists'
                })
            };
        }

        // Create new user account
        const { data: user, error } = await supabase.auth.signUp({
            email: email.toLowerCase(),
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    created_at: new Date().toISOString()
                }
            }
        });

        if (error) {
            console.error('Supabase auth error:', error);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: error.message })
            };
        }

        // Create user profile in custom users table
        const { error: profileError } = await supabase
            .from('users')
            .insert([
                {
                    id: user.user.id,
                    email: email.toLowerCase(),
                    full_name: fullName,
                    created_at: new Date().toISOString(),
                    last_login: null,
                    is_verified: false,
                    profile_data: {}
                }
            ]);

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Continue anyway as the auth user was created
        }

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Account created successfully! Please check your email to verify your account.',
                user: {
                    id: user.user.id,
                    email: user.user.email,
                    fullName: fullName,
                    isVerified: false
                },
                needsVerification: true
            })
        };

    } catch (error) {
        console.error('Registration error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error during registration'
            })
        };
    }
};